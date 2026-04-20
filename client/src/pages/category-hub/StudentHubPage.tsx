import { ALL_NAV_ITEMS } from '@/components/layout/navData';
import CategoryHubLayout from './CategoryHubLayout';

export default function StudentHubPage() {
  const tabs = ALL_NAV_ITEMS.filter(i => /^H\d+$/.test(i.code));
  return <CategoryHubLayout title="학생관리" category="학생관리" tabs={tabs} />;
}
