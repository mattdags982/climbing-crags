import Layout from '../../components/Layout';
import Image from 'next/image';
import clientPromise from '../../utils/mongodb';
import { getFrGrade } from '../../utils/infoCalc';
import Rating from '../../components/ui/Rating';
import Link from 'next/link';
import CommentSection from '../../components/CommentSection';
import { useState } from 'react';
import Close from '../../public/close.svg';
import { useRouter } from 'next/router';

export default function RoutePage({ route, comments }) {
  const router = useRouter();
  const [imageSrc, setImageSrc] = useState();
  const [uploadImage, setUploadImage] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [routeImage, setRouteImage] = useState(route.images ? route.images[0] : '/home.jpg');
  const [formDisabled, setFormDisabled] = useState(false);

  function handleChange(changeEvent) {
    const reader = new FileReader();
    reader.onload = (onloadEvent) => {
      setImageSrc(onloadEvent.target.result);
    };
    reader.readAsDataURL(changeEvent.target.files[0]);
  }

  function showUploadForm() {
    setImageSrc('');
    setUploadImage((prevState) => !prevState);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const cloudinaryId = process.env.NEXT_PUBLIC_CLOUDINARY_ID;
      const form = e.currentTarget;
      const fileInput = Array.from(form.elements).find(({ name }) => name === 'file');
      const formData = new FormData();
      if (fileInput.files[0].size > 1048576) {
        setFormDisabled(true);
        return;
      } else {
        setUploadingImage(true);
        setFormDisabled(false);
      }
      for (const file of fileInput.files) {
        formData.append('file', file);
      }
      formData.append('upload_preset', 'climbing-crags');
      const data = await fetch(`https://api.cloudinary.com/v1_1/${cloudinaryId}/upload`, {
        method: 'POST',
        body: formData,
      });
      const json = await data.json();
      setImageSrc('');
      setUploadingImage(false);
      setUploadImage(false);
      setRouteImage(json.secure_url);
      e.target.reset();
      const response = await fetch(`/api/routes/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageSrc: json.secure_url,
          path: router.asPath,
          id: route.id,
        }),
      });
      const jsonResponse = await response.json();
      console.log(jsonResponse);
    } catch (error) {
      console.error(error);
    }
  }
  return (
    <>
      <section className="px-4 md:px-36 pt-12 relative min-h-[70vh]">
        <div>
          <h1 className="text-3xl md:text-6xl font-semibold md:font-bold mb-4 text-white-high capitalize">
            {route.name}
          </h1>
          <h4 className="md:text-4xl text-white-high">
            <Link href={`/sector/${route.sector_id}`}>
              <a>{route.sector}, </a>
            </Link>
            <Link href={`/crag/${route.crag.toLowerCase()}`}>
              <a>{route.crag}</a>
            </Link>
          </h4>
          <div className="pt-20 text-2xl text-white flex items-center gap-x-4">
            Grade:
            <div className="border rounded-full aspect-square p-4 border-primary-600">
              {getFrGrade(route.grade_id)}
            </div>
          </div>
          <div className="pt-8 text-2xl text-white flex items-center gap-x-4">
            Rating: <Rating rating={route.rating} />
          </div>
          <button className="button mt-10" onClick={showUploadForm}>
            + add your own image
          </button>
          <div
            id="modal"
            className={`flex items-center justify-center fixed top-0 left-0 w-screen h-screen bg-dark-60 z-50 px-5 md:px-0 ${
              uploadImage ? '' : 'hidden'
            }`}
          >
            <form
              className="bg-dark-card rounded-4xl p-8"
              method="post"
              onChange={handleChange}
              onSubmit={handleSubmit}
            >
              <div className="pb-6 text-2xl font-semibold flex justify-between items-center">
                <h5>Upload your picture </h5>
                <Close className="w-6 cursor-pointer" onClick={showUploadForm} />
              </div>
              <p className="pl-1 text-sm pb-1">Only upload horizontal images</p>
              <input
                className="file:bg-primary-600 w-full file:text-white-true file:border-0 rounded-4xl border border-primary-600 file:p-2 file:mr-2 cursor-pointer"
                type="file"
                name="file"
              />
              {formDisabled && (
                <p className="pl-1 text-xs pt-1 text-red-500">file is too big: max-size 1Mb</p>
              )}
              <div className="aspect-video relative my-10 bg-white flex items-center justify-center">
                {imageSrc ? (
                  <Image className="object-cover" src={imageSrc} layout="fill" alt="" />
                ) : (
                  'placeolder'
                )}
              </div>
              <div className="flex items-center gap-x-5">
                <button disabled={!imageSrc || formDisabled} className="button" type="submit">
                  {uploadingImage ? 'uploading ' : 'Upload'}
                </button>
                {uploadingImage && (
                  <div className="spinner md:w-10 md:h-10 w-6 h-6 rounded-full"></div>
                )}
              </div>
            </form>
          </div>
        </div>
        <div className="absolute w-[150%] h-3/5 top-1/4 -left-32 md:top-10 md:left-[35%] md:w-full md:h-full -rotate-2">
          <Image
            className="rounded-4xl"
            src={routeImage}
            alt="crag image"
            layout="fill"
            objectFit="cover"
            priority={true}
          />
        </div>
      </section>
      <CommentSection comments={comments} />
    </>
  );
}

RoutePage.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};

// this preloads all the possible paths for the crag page
export async function getStaticPaths() {
  const client = await clientPromise;
  const db = client.db('Climbing-crags');
  const routesCollection = db.collection('routes');
  const routesCursor = await routesCollection.find({});
  const routes = await routesCursor
    .map((route) => {
      return { id: route.id };
    })
    .toArray();

  const paths = routes.map((route) => ({ params: { name: route.id } }));
  return {
    paths,
    fallback: false,
  };
}

// this preloads all the crag info for the specific paths
export async function getStaticProps(ctx) {
  let route;
  let comments;
  let client;
  try {
    client = await clientPromise;
    const db = client.db('Climbing-crags');
    const routesCollection = db.collection('routes');
    const routesCursor = await routesCollection.find({
      id: ctx.params.name,
    });
    route = await routesCursor
      .map((route) => {
        return { ...route, _id: route._id.toString() };
      })
      .toArray();
    const commentsCollection = db.collection('comments');
    const commentsCursor = await commentsCollection.find({ path: `/route/${ctx.params.name}` });
    comments = await commentsCursor
      .map((comment) => {
        return { ...comment, _id: comment._id.toString() };
      })
      .toArray();
    comments.sort((a, b) => b.comment_rating - a.comment_rating);
  } catch (error) {
    console.error(error);
  }

  return {
    props: {
      route: route[0],
      comments,
    },
  };
}
