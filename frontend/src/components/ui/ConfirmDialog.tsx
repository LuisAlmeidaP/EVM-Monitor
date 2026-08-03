import { Button } from './Button';
import { Modal } from './Modal';

interface ConfirmDialogProps {
  readonly titulo: string;
  readonly descripcion: string;
  readonly etiquetaConfirmar: string;
  readonly confirmando?: boolean;
  readonly onConfirmar: () => void;
  readonly onCancelar: () => void;
}

export function ConfirmDialog({
  titulo,
  descripcion,
  etiquetaConfirmar,
  confirmando = false,
  onConfirmar,
  onCancelar,
}: ConfirmDialogProps) {
  return (
    <Modal titulo={titulo} onCerrar={onCancelar}>
      <p className="text-sm leading-relaxed text-apagado">{descripcion}</p>
      <div className="mt-6 flex justify-end gap-3">
        <Button variant="secondary" onClick={onCancelar} disabled={confirmando}>
          Cancelar
        </Button>
        <Button variant="danger" onClick={onConfirmar} disabled={confirmando}>
          {confirmando ? 'Eliminando...' : etiquetaConfirmar}
        </Button>
      </div>
    </Modal>
  );
}
