type RichTextProps = {
  html: string;
  className?: string;
};

export default function RichText({ html, className }: RichTextProps) {
  return <div className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}

