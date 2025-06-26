import { Head, useForm, usePage } from '@inertiajs/react';
import { LoaderCircle, CheckCircle, XCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AuthLayout from '@/layouts/auth-layout';

type RegisterForm = {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    role: string;
};

interface Role {
    id: number;
    name: string;
}

interface RegisterProps {
    roles: Role[];
}

// Simple Alert component if the UI library doesn't have one
const Alert = ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={`rounded-lg border p-4 ${className}`}>
        {children}
    </div>
);

const AlertDescription = ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={`text-sm ${className}`}>
        {children}
    </div>
);

export default function Register({ roles = [] }: RegisterProps) {
    const { flash } = usePage().props as any;
    
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm<Required<RegisterForm>>({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('register'), {
            onSuccess: () => {
                reset();
                clearErrors();
            },
            onError: () => {
                reset('password', 'password_confirmation');
            }
        });
    };

    return (
        <AuthLayout title="Crea una cuenta" description="">
            <Head title="Register" />
            
            {flash?.success && (
                <Alert className="mb-4 border-green-200 bg-green-50">
                    <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-800">
                            {flash.success}
                        </AlertDescription>
                    </div>
                </Alert>
            )}

            {flash?.error && (
                <Alert className="mb-4 border-red-200 bg-red-50">
                    <div className="flex items-center gap-2">
                        <XCircle className="h-4 w-4 text-red-600" />
                        <AlertDescription className="text-red-800">
                            {flash.error}
                        </AlertDescription>
                    </div>
                </Alert>
            )}

            <form className="flex flex-col gap-6" onSubmit={submit}>
                <div className="grid gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Nombre</Label>
                        <Input
                            id="name"
                            type="text"
                            required
                            autoFocus
                            tabIndex={1}
                            autoComplete="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            disabled={processing}
                            placeholder="Nombre Completo"
                        />
                        <InputError message={errors.name} className="mt-2" />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="email">Correo Electronico</Label>
                        <Input
                            id="email"
                            type="email"
                            required
                            tabIndex={2}
                            autoComplete="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            disabled={processing}
                            placeholder="email@example.com"
                        />
                        <InputError message={errors.email} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password">Contraseña</Label>
                        <Input
                            id="password"
                            type="password"
                            required
                            tabIndex={3}
                            autoComplete="new-password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            disabled={processing}
                            placeholder="*******"
                        />
                        <InputError message={errors.password} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password_confirmation">Confirma Contraseña</Label>
                        <Input
                            id="password_confirmation"
                            type="password"
                            required
                            tabIndex={4}
                            autoComplete="new-password"
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            disabled={processing}
                            placeholder="********"
                        />
                        <InputError message={errors.password_confirmation} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="role">Rol</Label>
                        <Select
                            value={data.role}
                            onValueChange={(value) => setData('role', value)}
                            disabled={processing}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Selecciona un rol" />
                            </SelectTrigger>
                            <SelectContent>
                                {roles && roles.length > 0 ? (
                                    roles.map((role) => (
                                        <SelectItem key={role.id} value={role.name}>
                                            {role.name}
                                        </SelectItem>
                                    ))
                                ) : (
                                    <SelectItem value="" disabled>
                                        No hay roles disponibles
                                    </SelectItem>
                                )}
                            </SelectContent>
                        </Select>
                        <InputError message={errors.role} />
                    </div>

                    <Button type="submit" className="mt-2 w-full" tabIndex={6} disabled={processing}>
                        {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        Crear Cuenta
                    </Button>
                </div>

                {/* <div className="text-muted-foreground text-center text-sm">
                    ¿Ya tienes una cuenta?{' '}
                    <TextLink href={route('login')} tabIndex={6}>
                        Inicia Sesión
                    </TextLink>
                </div> */}
            </form>
        </AuthLayout>
    );
}
