import Navbar from './Navbar';
import FeatureBar from './FeatureBar';

export default function Header({ companySettings }) {
  return (
    <>
      <FeatureBar companySettings={companySettings} />
      <Navbar />
    </>
  );
}
