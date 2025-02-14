"use client";
import { authClient } from "@/lib/auth-client";
import { useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, UserPlus, LogIn } from "lucide-react";
import cx from "classnames";
import { toast } from "react-hot-toast";

type AuthFormData = {
  email: string;
  password: string;
  name?: string;
};

export default function AuthForm() {
  const [isSignUp, setIsSignUp] = useState(true);
  const [formData, setFormData] = useState<AuthFormData>({
    email: "",
    password: "",
    name: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isSignUp) {
        const { error } = await authClient.signUp.email(formData, {
          onSuccess: (ctx) => {
            toast.success("Inscription réussie ! Redirection...");
            window.location.href = "/";
          },
        });

        if (error) {
          toast.error(error.message || "Erreur lors de l'inscription");
        }
      } else {
        const { error } = await authClient.signIn.email(formData, {
          onSuccess: (ctx) => {
            toast.success("Connexion réussie !");
            window.location.href = "/";
          },
        });

        if (error) {
          toast.error(
            error.message === "Invalid password"
              ? "Mot de passe incorrect"
              : error.message || "Erreur de connexion"
          );
        }
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erreur inconnue";

      if (errorMessage.includes("existing email")) {
        toast.error("Cet email est déjà associé à un compte");
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#faf6f1] to-[#f0e6d9] p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-2xl shadow-xl border border-[#e6d5c3] overflow-hidden">
          {/* Header avec onglets */}
          <div className="flex">
            <button
              onClick={() => setIsSignUp(true)}
              className={cx(
                "flex-1 p-4 text-center transition-colors",
                isSignUp
                  ? "bg-[#faf6f1] text-[#b85c38]"
                  : "bg-white text-[#665147] hover:bg-[#faf6f1]"
              )}
            >
              <div className="flex items-center justify-center gap-2">
                <UserPlus className="w-5 h-5" />
                <span className="font-medium">Inscription</span>
              </div>
            </button>
            <button
              onClick={() => setIsSignUp(false)}
              className={cx(
                "flex-1 p-4 text-center transition-colors",
                !isSignUp
                  ? "bg-[#faf6f1] text-[#b85c38]"
                  : "bg-white text-[#665147] hover:bg-[#faf6f1]"
              )}
            >
              <div className="flex items-center justify-center gap-2">
                <LogIn className="w-5 h-5" />
                <span className="font-medium">Connexion</span>
              </div>
            </button>
          </div>

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="space-y-4">
              {isSignUp && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <label className="block text-sm font-medium text-[#4a3427] mb-2">
                    Nom complet
                  </label>
                  <input
                    name="name"
                    type="text"
                    required
                    className="w-full px-4 py-3 rounded-lg border border-[#e6d5c3] 
                             focus:ring-2 focus:ring-[#b85c38] focus:border-transparent
                             placeholder-[#a39183] transition-all"
                    placeholder="Jean Dupont"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </motion.div>
              )}

              <div>
                <label className="block text-sm font-medium text-[#4a3427] mb-2">
                  Email
                </label>
                <input
                  name="email"
                  type="email"
                  required
                  className="w-full px-4 py-3 rounded-lg border border-[#e6d5c3] 
                           focus:ring-2 focus:ring-[#b85c38] focus:border-transparent
                           placeholder-[#a39183] transition-all"
                  placeholder="exemple@email.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#4a3427] mb-2">
                  Mot de passe
                </label>
                <input
                  name="password"
                  type="password"
                  required
                  className="w-full px-4 py-3 rounded-lg border border-[#e6d5c3] 
                           focus:ring-2 focus:ring-[#b85c38] focus:border-transparent
                           placeholder-[#a39183] transition-all"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 px-4 bg-gradient-to-r from-[#b85c38] to-[#a34e2e] 
                       text-white rounded-lg font-medium disabled:opacity-50
                       transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
              ) : isSignUp ? (
                <>
                  <UserPlus className="w-5 h-5" />
                  S&apos;inscrire
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Se connecter
                </>
              )}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
