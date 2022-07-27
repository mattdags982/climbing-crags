import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import Layout from '../components/layout';
import * as Realm from 'realm-web';

export default function Home() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [routes, setRoutes] = useState([]);

  const handleOnSubmit = async (e) => {
    e.preventDefault();
    router.push(`/?search=${searchTerm}`);
  };

  useEffect(() => {
    const REALM_APP_ID = process.env.NEXT_PUBLIC_REALM_APP_ID;
    const app = new Realm.App({ id: REALM_APP_ID });
    const credentials = Realm.Credentials.anonymous();

    async function connectDB() {
      try {
        const user = await app.logIn(credentials);
        // const client = app.currentUser.mongoClient('mongodb-atlas');
        // const cragsDb = client.db('Climbing-crags').collection('Crags');
        // const crags = await cragsDb.find();
        if (router.query.search) {
          const allRoutes = await user.functions.searchRoutes(router.query.search);
          console.log(allRoutes);
          setRoutes(() => allRoutes);
        }
      } catch (error) {
        console.error(error);
      }
    }

    connectDB();
  }, [router.query]);

  return (
    <>
      <div
        className="mt-12 h-[80vh] flex items-center justify-center flex-col clip-image bg-cover mb-80 bg-[-15rem_center] md:bg-center"
        style={{ backgroundImage: 'url("/home.jpg")' }}
      >
        <h1 className="text-white-true font-semibold md:text-9xl text-4xl">Climbing Crags</h1>
        <form
          action="submit"
          className="md:mt-20 mt-12 md:w-1/2 w-full flex md:gap-x-6 gap-x-2 px-4"
          onSubmit={handleOnSubmit}
        >
          <input
            type="text"
            placeholder="Type to search..."
            className="w-full"
            onChange={(e) => setSearchTerm(e.target.value)}
            value={searchTerm}
          />
          <button className="button" type="submit">
            Search
          </button>
        </form>
      </div>
    </>
  );
}

Home.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};
