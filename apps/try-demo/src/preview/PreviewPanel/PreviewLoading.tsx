interface Props {
  stage: 'generating' | 'streaming';
  model: string | null;
}

const STAGE_LABEL: Record<Props['stage'], string> = {
  generating: 'Generating your app…',
  streaming: 'Assembling manifest…',
};

export function PreviewLoading({ stage, model }: Props) {
  return (
    <div className="preview-floating">
      <div className="preview-floating-spinner" />
      <div className="preview-floating-title">{STAGE_LABEL[stage]}</div>
      {model && <div className="preview-floating-sub">{model}</div>}
    </div>
  );
}
