import AnnouncementBar from './AnnouncementBar';
import Navbar from './Navbar';
import FeatureBar from './FeatureBar';

export default function Header({ companySettings }) {
  return (
    <>
      <AnnouncementBar />
      <Navbar />
      <FeatureBar companySettings={companySettings} />
    </>
  );
}
