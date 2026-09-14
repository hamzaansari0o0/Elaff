import Navbar from './Navbar';
import FeatureBar from './FeatureBar';

export default function Header({ companySettings, collections }) {
  return (
    <>
      <FeatureBar companySettings={companySettings} />
      <Navbar collections={collections} />
    </>
  );
}
