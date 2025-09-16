import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import Image from "../../assets/logo.jpeg";
import { Link } from "react-router-dom";

export default function SignUp() {
  const [password, setPassword] = useState<boolean | null>(false);

  const handleSubmit = () => {
    console.log("Enviar dados");
  };

  return (
    <div className="min-h-screen grid sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2">
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="mb-8 flex justify-center">
            <img src={Image} alt="Sua Logo" className="h-10 w-auto" />
          </div>
          <h1 className="text-2xl font-bold text-gray-700 mb-6">
            Bem vindo(a) de volta!
          </h1>

          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Nome
              </label>
              <input
                type="text"
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-600 focus:outline-none"
                placeholder="Seu nome"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                E-mail
              </label>
              <input
                type="email"
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-600 focus:outline-none"
                placeholder="voce@exemplo.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Senha
              </label>
              <input
                type="password"
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-600 focus:outline-none"
                placeholder="••••••••"
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="inline-flex items-center gap-2">
                <input type="checkbox" className="rounded" />
                Lembrar de mim
              </label>
              <button type="button" className="text-blue-600 hover:underline">
                Esqueci minha senha
              </button>
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-blue-600 px-4 py-2.5 font-semibold text-white hover:bg-blue-700 transition"
            >
              <Link to={"/dashboard"}>Entrar</Link>
            </button>
          </form>
          {/* <div className="mt-6 flex justify-center items-center text-sm text-gray-600">
            <>
             Esqueceu sua senha?
              <button className="text-blue-600 font-medium hover:underline">
                alterar
              </button>
            </>

          </div> */}
        </div>
      </div>

      <div className="hidden lg:flex relative overflow-hidden md:">
        <img
          src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1600&auto=format&fit=crop"
          alt="foto-da-sua-empresa"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-blue-900/60" />
        <div className="relative z-10 m-auto p-10 text-center text-white max-w-md">
          <h2 className="text-3xl font-bold leading-tight">
            Organize estudos, turmas e notas num só lugar
          </h2>
          <p className="mt-3 text-blue-100">
            Plataforma acadêmica simples, rápida e feita para o dia a dia.
          </p>
        </div>
      </div>
    </div>
  );
}
