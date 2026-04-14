import type { MyBanner2Props } from './MyBanner2PresentationSchema';

export function MyBanner2(props: MyBanner2Props) {
  return (
    <div>
      <p><strong>p!!rout!</strong></p>
      <pre>{JSON.stringify(props, null, 2)}</pre>
    </div>
  );
}
