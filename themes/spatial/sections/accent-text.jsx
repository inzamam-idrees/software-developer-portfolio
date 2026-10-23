export default function AccentText({ children }) {
  const words = children.trim().split(/\s+/);
  const accent = words.pop();
  return <>{words.length > 0 && `${words.join(" ")} `}<em>{accent}</em></>;
}
