import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import Image from "../../assets/logo.jpeg";

export default function SignUp() {
  const [password, setPassword] = useState<boolean | null>(false);

  const handleSubmit = () => {
    console.log("Enviar dados");
  };
const [mode, setMode] = useState<"login" | "signup">("login");

  return (
    <div className="min-h-screen grid md:grid-cols-2">
      {/* Lado 1: formulário */}
      <div className="flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          {/* Logo pequena no topo (opcional) */}
          <div className="mb-8">
            <img
              src="/logo.svg"
              alt="Sua Logo"
              className="h-10 w-auto"
            />
          </div>

          <h1 className="text-2xl font-bold text-gray-900">
            {mode === "login" ? "Entrar" : "Criar conta"}
          </h1>
          <p className="text-gray-500 mb-6">
            {mode === "login"
              ? "Bem-vindo(a) de volta!"
              : "Preencha seus dados para começar."}
          </p>

          <form className="space-y-4">
            {mode === "signup" && (
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
            )}

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

            {mode === "login" && (
              <div className="flex items-center justify-between text-sm">
                <label className="inline-flex items-center gap-2">
                  <input type="checkbox" className="rounded" />
                  Lembrar de mim
                </label>
                <button type="button" className="text-blue-600 hover:underline">
                  Esqueci minha senha
                </button>
              </div>
            )}

            <button
              type="submit"
              className="w-full rounded-lg bg-blue-600 px-4 py-2.5 font-semibold text-white hover:bg-blue-700 transition"
            >
              {mode === "login" ? "Entrar" : "Criar conta"}
            </button>
          </form>

          <div className="mt-6 text-sm text-gray-600">
            {mode === "login" ? (
              <>
                Não tem conta?{" "}
                <button
                  onClick={() => setMode("signup")}
                  className="text-blue-600 font-medium hover:underline"
                >
                  Cadastre-se
                </button>
              </>
            ) : (
              <>
                Já possui conta?{" "}
                <button
                  onClick={() => setMode("login")}
                  className="text-blue-600 font-medium hover:underline"
                >
                  Entrar
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Lado 2: imagem + headline */}
      <div className="hidden md:flex relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1600&auto=format&fit=crop"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-blue-900/60" />
        <div className="relative z-10 m-auto p-10 text-center text-white max-w-md">
          <img src="/logo-white.svg" alt="Logo" className="h-12 mx-auto mb-6" />
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
