import type { MyBannerProps } from './MyBannerPresentationSchema';

export function MyBanner(props: MyBannerProps) {
  return (
    <div>
      {/* TODO: implement MyBanner */}
      <pre>{JSON.stringify(props, null, 2)}</pre>
    </div>
  );
}
