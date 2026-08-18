import AnnouncementBar from './AnnouncementBar';
import Navbar from './Navbar';
import FeatureBar from './FeatureBar';
import { getAllCollections } from '@/lib/products';

export default async function Header() {
  const collections = await getAllCollections();

  return (
    <>
      <AnnouncementBar />
      <Navbar collections={collections} />
      <FeatureBar />
    </>
  );
}