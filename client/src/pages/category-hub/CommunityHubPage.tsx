import { ALL_NAV_ITEMS } from '@/components/layout/navData';
import CategoryHubLayout from './CategoryHubLayout';

export default function CommunityHubPage() {
  const tabs = ALL_NAV_ITEMS.filter(i => /^G\d+$/.test(i.code));
  return <CategoryHubLayout title="커뮤니티" category="커뮤니티" tabs={tabs} />;
}
