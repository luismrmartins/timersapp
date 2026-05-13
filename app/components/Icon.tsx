type Props = {
  name: string;
  className?: string;
};

export default function Icon({ name, className = "" }: Props) {
  return (
    <span
      className={`material-symbols-outlined normal-case tracking-normal ${className}`}
      aria-hidden
    >
      {name}
    </span>
  );
}
