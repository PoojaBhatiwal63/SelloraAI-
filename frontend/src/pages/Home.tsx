import { useState } from "react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    GraduationCap,
    Code2,
    LayoutTemplate,
    BookOpen,
    MessageSquare,
    Menu,
    X,
    LogOut,
    type LucideIcon,
    Contact,
} from "lucide-react";
import heroImage from "../assets/image.png";
import logo from "../assets/logo.png";
import { FcGoogle } from "react-icons/fc";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "@/utils/firebase";
import api from "@/utils/axios";

import { useDispatch, useSelector } from "react-redux";
import { type AppDispatch, type RootState } from "@/redux/store";
import { logoutUser, setUser } from "@/redux/userSlice";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import type { IAdmin } from "@/App";

// ---------------------------------------------
// Types
// ---------------------------------------------
interface Category {
    title: string;
    icon: LucideIcon;
    // AI Prompts jaisa highlighted card (indigo text/border)
}

interface Step {
    number: number;
    title: string;
    desc: string;
}

// ---------------------------------------------
// Data (isko change karke apna content daal sakte ho)
// ---------------------------------------------
const categories: Category[] = [
    { title: "Courses", icon: GraduationCap },
    { title: "Source Code", icon: Code2 },
    { title: "Templates", icon: LayoutTemplate },
    { title: "Ebooks", icon: BookOpen },
    { title: "AI Prompts", icon: MessageSquare },
];

const steps: Step[] = [
    {
        number: 1,
        title: "Explore Products",
        desc: "Browse thousands of high-quality digital assets across multiple categories.",
    },
    {
        number: 2,
        title: "Purchase Instantly",
        desc: "Secure checkout and immediate access to your downloaded files or links.",
    },
    {
        number: 3,
        title: "Sell & Earn",
        desc: "Join as a creator, upload your work, and start generating passive income.",
    },
];

// Demo user (login ke baad yehi data set hota hai). Real app me ye Firebase se aayega.

// naam se initials nikalne ke liye helper (avatar fallback ke liye)
function getInitials(name: string): string {
    return name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .toUpperCase();
}

// small helper: fade-up animation jo scroll pe trigger hoga
const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};
interface AdminProps {
  admin: IAdmin| null;
}
export default function Home({
  admin,
}: AdminProps) {
    const [menuOpen, setMenuOpen] = useState<boolean>(false); // mobile nav toggle
    const [modalOpen, setModalOpen] = useState<boolean>(false); // login modal toggle
    const dispatch = useDispatch<AppDispatch>()
    const navigate = useNavigate()
    // logged-in user ka data (null = logged out)
    const { user } = useSelector((state: RootState) => state.user);
    const handleGoogleLogin = async () => {

        try {


            const result = await signInWithPopup(
                auth,
                provider
            );



            const token = await result.user.getIdToken();



            const response = await api.post(
                "/api/auth/login",
                {
                    token
                }
            );


            dispatch(setUser(response.data.user));
            setModalOpen(false);
            toast.success("Login Successfully.")


        } catch (error) {

            console.log("Login Error:", error);
            toast.error("Login Error.")

        }

    }

    const handleLogout = async () => {
        try {
            const response = await api.get("/api/auth/logout")

            if (response.data.success) {

                dispatch(
                    logoutUser()
                );

            }
            toast.success("Logout Successfully.")
        } catch (error) {
            console.log(error)
            toast.error("Logout Error.")
        }
    }


    return (
        <div className="min-h-screen w-full bg-white text-slate-900">
            {/* ---------------- Header ---------------- */}
            <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/80 backdrop-blur">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
                    {/* Logo: image + name */}
                    <div className="flex items-center gap-2">
                        <img
                            src={logo}
                            alt="SelloraAI logo"
                            className="h-6 w-6 rounded-sm object-contain"
                        />
                        <span className="text-lg font-semibold tracking-tight">SelloraAI</span>
                    </div>

                    {/* Right side: user info + logout OR sign in button */}
                    <div className="hidden items-center gap-3 md:flex">
                        {user ? (
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2">
                                    <Avatar className="h-8 w-8">
                                        <AvatarFallback className="bg-indigo-100 text-xs font-medium text-indigo-600">
                                            {getInitials(user?.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="text-sm font-medium text-slate-700">
                                        {user?.name}
                                    </span>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="gap-1.5"
                                    onClick={handleLogout}
                                >
                                    <LogOut className="h-4 w-4" />
                                    Logout
                                </Button>
                            </div>
                        ) : (
                            <Button
                                className="bg-indigo-600 hover:bg-indigo-700"
                                onClick={() => setModalOpen(true)}
                            >
                                Sign In
                            </Button>
                        )}
                    </div>

                    {/* Mobile menu toggle */}
                    <button
                        className="md:hidden"
                        onClick={() => setMenuOpen((open) => !open)}
                        aria-label="Toggle menu"
                    >
                        {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </div>

                {/* Mobile nav panel */}
                {menuOpen && (
                    <div className="flex flex-col gap-4 border-t border-slate-100 px-4 py-4 sm:px-6 md:hidden">
                        {user ? (
                            <>
                                <div className="flex items-center gap-2">
                                    <Avatar className="h-8 w-8">
                                        <AvatarFallback className="bg-indigo-100 text-xs font-medium text-indigo-600">
                                            {getInitials(user.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="text-sm font-medium text-slate-700">
                                        {user.name}
                                    </span>
                                </div>
                                <Button
                                    variant="outline"
                                    className="w-full gap-1.5"
                                    onClick={handleLogout}
                                >
                                    <LogOut className="h-4 w-4" />
                                    Logout
                                </Button>
                            </>
                        ) : (
                            <Button
                                className="w-full bg-indigo-600 hover:bg-indigo-700"
                                onClick={() => setModalOpen(true)}
                            >
                                Sign In
                            </Button>
                        )}
                    </div>
                )}
            </header>

            {/* ---------------- Hero ---------------- */}
            <section className="bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
                <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-4 py-14 sm:px-6 sm:py-20 md:grid-cols-2 md:gap-12">
                    {/* Left: text content */}
                    <motion.div
                        initial="hidden"
                        animate="show"
                        variants={fadeUp}
                        className="space-y-6 text-center md:text-left"
                    >
                        <span className="inline-block rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium tracking-wide text-indigo-600">
                            PREMIUM MARKETPLACE
                        </span>
                        <h1 className="text-2xl font-semibold leading-tight text-slate-900 sm:text-3xl md:text-4xl">
                            Discover Premium Digital Products Built by Creators
                        </h1>
                        <p className="mx-auto max-w-md text-slate-600 md:mx-0">
                            Buy courses, source codes, templates, AI prompts, ebooks and digital
                            assets from trusted creators. Elevate your projects with top-tier
                            resources.
                        </p>
                        <div className="flex flex-wrap justify-center gap-3 pt-2 md:justify-start">
                            {/* Logged in ho toh "Start selling", nahi toh "Become a Partner" (login modal kholta hai) */}
                            {user ? (
                                <Button onClick={()=>navigate("/partner")} className="bg-indigo-600 px-6 hover:bg-indigo-700">
                                    Start selling your digital products
                                </Button>
                            ) : (
                                <Button
                                    className="bg-indigo-600 px-6 hover:bg-indigo-700"
                                    onClick={() => setModalOpen(true)}
                                >
                                    Become a Partner
                                </Button>
                            )}
                        </div>
                    </motion.div>

                    {/* Right: hero image */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6, delay: 0.15 }}
                        className="rounded-2xl bg-white p-4 shadow-xl shadow-indigo-100 sm:p-6"
                    >
                        <img
                            src={heroImage}
                            alt="Digital products illustration"
                            className="w-full rounded-lg object-cover"
                        />
                    </motion.div>
                </div>
            </section>

            {/* ---------------- Popular Categories ---------------- */}
            <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
                <motion.div
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, amount: 0.4 }}
                    variants={fadeUp}
                    className="mb-10 text-center sm:mb-12"
                >
                    <h2 className="text-lg font-semibold text-slate-900">Popular Categories</h2>
                    <p className="mt-2 text-sm text-slate-500">
                        Explore our curated selection of high-quality digital assets.
                    </p>
                </motion.div>

                {/* Compact row of category cards, jaise screenshot me hai */}
                <div className="flex flex-wrap justify-center gap-4">
                    {categories.map((cat, i) => {
                        const Icon = cat.icon;
                        return (
                            <motion.div
                                key={cat.title}
                                initial="hidden"
                                whileInView="show"
                                viewport={{ once: true, amount: 0.3 }}
                                variants={fadeUp}
                                transition={{ delay: i * 0.06 }}
                                className="flex w-28 flex-col items-center gap-2 rounded-xl border bg-slate-50 px-4 py-5 text-center transition-colors sm:w-32 
                  
                    hover:border-indigo-200 bg-indigo-50
                     border-slate-100"

                            >
                                <Icon
                                    className="h-6 w-6 hover:text-indigo-600 text-slate-700"

                                />
                                <span
                                    className="font-mono text-xs 
                    hover:text-indigo-600 text-slate-700"

                                >
                                    {cat.title}
                                </span>
                            </motion.div>
                        );
                    })}
                </div>
            </section>

            {/* ---------------- How It Works ---------------- */}
            <section className="bg-indigo-50/60 py-16 sm:py-24">
                <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
                    <motion.div
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, amount: 0.4 }}
                        variants={fadeUp}
                    >
                        <h2 className="text-lg font-semibold text-slate-900">How It Works</h2>
                        <p className="mt-2 text-sm text-slate-500">
                            A seamless experience for both buyers and creators.
                        </p>
                    </motion.div>

                    <div className="mt-14 grid grid-cols-1 gap-10 sm:grid-cols-3 sm:gap-6">
                        {steps.map((step, i) => (
                            <motion.div
                                key={step.number}
                                initial="hidden"
                                whileInView="show"
                                viewport={{ once: true, amount: 0.4 }}
                                variants={fadeUp}
                                transition={{ delay: i * 0.1 }}
                                className="relative flex flex-col items-center"
                            >
                                {/* connector line: circle ke center ko pichle circle ke center se jodti hai */}
                                {i !== 0 && (
                                    <span className="absolute right-1/2 top-5 hidden h-0.5 w-full bg-slate-300 sm:block" />
                                )}

                                <div
                                    className="relative z-10 mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-white text-sm font-semibold text-slate-700 shadow-sm hover:bg-indigo-600 hover:text-white"
                                >
                                    {step.number}
                                </div>
                                <h3 className="font-medium text-slate-900">{step.title}</h3>
                                {/* divider line jo heading ko description se separate karti hai */}
                                <div className="my-3 h-px w-28 bg-slate-200" />
                                <p className="max-w-[220px] text-sm text-slate-500">{step.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ---------------- Footer (simple, bina links ke) ---------------- */}
            <footer className="bg-slate-950 py-12 text-slate-300">
                <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 text-center sm:px-6">
                    <div className="flex items-center gap-2">
                        <img
                            src={logo}
                            alt="SelloraAI logo"
                            className="h-6 w-6 rounded-sm object-contain"
                        />
                        <span className="text-base font-semibold text-white">SelloraAI</span>
                    </div>

                    <p className="max-w-sm text-sm text-slate-400">
                        The premier infrastructure for AI-driven commerce. Empowering creators
                        globally.
                    </p>

                    <div className="flex text-sm item-center justify-center gap-2 text-slate-400">
                        <Contact size={20} /> Email -
                        {admin?.email}
                       
                    </div>

                    <div className="mt-4 w-full border-t border-slate-800 pt-6 text-xs text-slate-500">
                        © 2024 SelloraAI. All rights reserved.
                    </div>
                </div>
            </footer>

            {/* ---------------- Login Modal ---------------- */}
            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader className="items-center text-center">
                        <img
                            src={logo}
                            alt="SelloraAI logo"
                            className="h-10 w-10 rounded-md object-contain"
                        />
                        <DialogTitle className="mt-2 text-lg font-semibold">
                            SelloraAI
                        </DialogTitle>
                    </DialogHeader>

                    <Button
                        variant="outline"
                        className="mt-2 w-full gap-2"
                        onClick={handleGoogleLogin}
                    >
                        <FcGoogle className="h-4 w-4" />
                        Continue with Google
                    </Button>

                    <p className="mt-4 text-center text-xs text-slate-400">
                        Secure authentication by Firebase
                    </p>
                </DialogContent>
            </Dialog>
        </div>
    );
}