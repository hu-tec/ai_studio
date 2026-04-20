import { ALL_NAV_ITEMS } from '@/components/layout/navData';
import CategoryHubLayout from './CategoryHubLayout';

export default function FormHubPage() {
  const tabs = ALL_NAV_ITEMS.filter(i => /^I\d+$/.test(i.code));
  return <CategoryHubLayout title="서식/확인서" category="서식/확인서" tabs={tabs} />;
}
