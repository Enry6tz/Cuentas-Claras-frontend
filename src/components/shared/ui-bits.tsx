import { Crown, Eye, User as UserIcon } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { avatarColor, initials, cn } from '@/lib/utils';
import type { ParticipationRole, TripStatus } from '@/types';

/**
 * Avatar de persona con color sólido determinista e iniciales blancas.
 * `seed` debe ser un id estable (userId o email) para mantener el color
 * consistente entre pantallas; `name` solo se usa para las iniciales.
 */
export function PersonAvatar({
  name,
  seed,
  className,
}: {
  name: string;
  seed: string;
  className?: string;
}) {
  return (
    <Avatar className={cn('size-9', className)}>
      <AvatarFallback className={cn(avatarColor(seed), 'text-white font-semibold')}>
        {initials(name) || '?'}
      </AvatarFallback>
    </Avatar>
  );
}

/** Badge de estado del viaje: punto de color + texto. */
export function TripStatusBadge({
  status,
  className,
}: {
  status: TripStatus;
  className?: string;
}) {
  if (status === 'ACTIVE') {
    return (
      <Badge
        variant="secondary"
        className={cn('gap-1.5 bg-success/10 text-success border-transparent', className)}
      >
        <span className="size-1.5 rounded-full bg-success" />
        En curso
      </Badge>
    );
  }
  return (
    <Badge variant="secondary" className={cn('gap-1.5 text-muted-foreground', className)}>
      <span className="size-1.5 rounded-full bg-muted-foreground" />
      Finalizado
    </Badge>
  );
}

const roleMeta: Record<
  ParticipationRole,
  { label: string; icon: typeof Crown; variant: 'default' | 'secondary' | 'outline' }
> = {
  CREATOR: { label: 'Creador', icon: Crown, variant: 'default' },
  SUPERVISOR: { label: 'Supervisor', icon: Eye, variant: 'secondary' },
  MEMBER: { label: 'Miembro', icon: UserIcon, variant: 'outline' },
};

/** Indicador de rol con icono. */
export function RoleBadge({
  role,
  className,
}: {
  role: ParticipationRole;
  className?: string;
}) {
  const { label, icon: Icon, variant } = roleMeta[role];
  return (
    <Badge variant={variant} className={cn('gap-1', className)}>
      <Icon className="size-3.5" />
      {label}
    </Badge>
  );
}
