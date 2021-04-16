import Link from 'next/link';

import style from './styles.module.scss';

export function ExitPreviewBtn() {
  return (
    <button type="button" className={style.exitBtn}>
      <Link href="/api/exit-preview">Sair do modo Preview</Link>
    </button>
  );
}
