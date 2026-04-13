import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { MapPin, Receipt, CreditCard, ArrowRight } from 'lucide-react';

const features = [
  {
    icon: MapPin,
    title: 'Gestión de viajes',
    description: 'Organiza los gastos por viaje y mantén todo en un solo lugar.',
    color: 'bg-primary/10 text-primary',
  },
  {
    icon: Receipt,
    title: 'División de gastos',
    description: 'Divide los costos de forma justa entre los participantes, con soporte multi-moneda.',
    color: 'bg-success/10 text-success',
  },
  {
    icon: CreditCard,
    title: 'Simplificación de deudas',
    description: 'Minimiza la cantidad de pagos necesarios para saldar cuentas.',
    color: 'bg-warning/10 text-warning',
  },
];

export default async function HomePage() {
  const { userId } = await auth();
  if (userId) redirect('/dashboard');

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <h1 className="text-xl font-bold text-primary">Cuentas Claras</h1>
          <div className="flex items-center gap-3">
            <Link
              href="/sign-in"
              className="rounded-lg px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/sign-up"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Comenzar
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="flex flex-1 flex-col items-center justify-center px-6 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-1.5 text-sm font-medium text-secondary-foreground">
            <MapPin className="h-4 w-4" />
            Dividir gastos de viaje nunca fue tan fácil
          </div>
          <h2 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Divide costos,{' '}
            <span className="text-primary">no amistades</span>
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
            Registra gastos compartidos, maneja múltiples monedas, calcula balances
            y salda deudas — todo en un solo lugar.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-base font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Empezar gratis
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/sign-in"
              className="inline-flex items-center gap-2 rounded-lg border border-input px-6 py-3 text-base font-medium text-foreground hover:bg-accent transition-colors"
            >
              Ya tengo una cuenta
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t bg-muted/30 px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <h3 className="text-center text-2xl font-bold text-foreground">
            Todo lo que necesitas para gastos grupales de viaje
          </h3>
          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="text-center">
                  <div className={`mx-auto inline-flex rounded-xl p-3 ${f.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h4 className="mt-4 text-base font-semibold text-foreground">{f.title}</h4>
                  <p className="mt-2 text-sm text-muted-foreground">{f.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card px-6 py-6">
        <p className="text-center text-sm text-muted-foreground">
          Cuentas Claras — Hecho por viajeros, para viajeros.
        </p>
      </footer>
    </div>
  );
}
