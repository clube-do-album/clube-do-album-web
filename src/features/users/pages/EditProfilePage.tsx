import { ArrowLeft, Edit3 } from 'lucide-react';
import type { Session } from '../../../types';

type EditProfileScreenProps = {
  session: Session;
  onBack: () => void;
};

export function EditProfileScreen({ session, onBack }: EditProfileScreenProps) {
  return (
    <section className="content-card narrow-card glass-panel">
      <button className="back-button" onClick={onBack}>
        <ArrowLeft size={18} />
        Perfil
      </button>
      <div className="section-heading">
        <h2>Editar perfil</h2>
        <Edit3 size={20} />
      </div>
      <label>
        Nome
        <input value={session.user.name} disabled />
      </label>
      <label>
        Email
        <input value={session.user.email} disabled />
      </label>
    </section>
  );
}
