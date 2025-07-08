"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { ChevronLeft, ChevronRight, Heart, Gift, Cake, Sparkles, Send, Mail, Moon, Star, Shuffle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

// Declare emailjs as global
declare global {
  interface Window {
    emailjs: any
  }
}

// Tarot cards data
const tarotCards = [
  { name: "The Fool", meaning: "Perjalanan baru, spontanitas, keberanian mengambil risiko", emoji: "🃏" },
  { name: "The Magician", meaning: "Kekuatan manifestasi, kreativitas, kemampuan mewujudkan impian", emoji: "🎩" },
  { name: "The High Priestess", meaning: "Intuisi, kebijaksanaan batin, misteri yang akan terungkap", emoji: "🌙" },
  { name: "The Empress", meaning: "Kelimpahan, cinta, kreativitas, dan kesuburan dalam hidup", emoji: "👑" },
  { name: "The Emperor", meaning: "Kepemimpinan, stabilitas, struktur, dan otoritas", emoji: "⚔️" },
  { name: "The Hierophant", meaning: "Tradisi, pembelajaran, bimbingan spiritual", emoji: "📿" },
  { name: "The Lovers", meaning: "Cinta sejati, pilihan penting, harmoni dalam hubungan", emoji: "💕" },
  { name: "The Chariot", meaning: "Kemenangan, determinasi, kontrol atas situasi", emoji: "🏆" },
  { name: "Strength", meaning: "Kekuatan batin, keberanian, kesabaran dalam menghadapi tantangan", emoji: "🦁" },
  { name: "The Hermit", meaning: "Pencarian makna, refleksi diri, kebijaksanaan dari dalam", emoji: "🕯️" },
  { name: "Wheel of Fortune", meaning: "Perubahan nasib, siklus kehidupan, keberuntungan", emoji: "🎡" },
  { name: "Justice", meaning: "Keadilan, keseimbangan, konsekuensi dari tindakan", emoji: "⚖️" },
  { name: "The Hanged Man", meaning: "Perspektif baru, pengorbanan, pelepasan kontrol", emoji: "🙃" },
  { name: "Death", meaning: "Transformasi, akhir dari satu fase, kelahiran kembali", emoji: "🦋" },
  { name: "Temperance", meaning: "Keseimbangan, moderasi, penyembuhan", emoji: "🍃" },
  { name: "The Devil", meaning: "Pembebasan dari belenggu, mengatasi ketergantungan", emoji: "⛓️" },
  { name: "The Tower", meaning: "Perubahan mendadak, pencerahan, pembebasan", emoji: "⚡" },
  { name: "The Star", meaning: "Harapan, inspirasi, bimbingan spiritual", emoji: "⭐" },
  { name: "The Moon", meaning: "Ilusi, intuisi, menghadapi ketakutan bawah sadar", emoji: "🌙" },
  { name: "The Sun", meaning: "Kebahagiaan, kesuksesan, vitalitas, pencapaian", emoji: "☀️" },
  { name: "Judgement", meaning: "Kebangkitan spiritual, panggilan hidup, transformasi", emoji: "📯" },
  { name: "The World", meaning: "Penyelesaian, pencapaian, kesempurnaan, siklus lengkap", emoji: "🌍" },
]

export default function Component() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")
  const [emailjsLoaded, setEmailjsLoaded] = useState(false)
  const [lifeTime, setLifeTime] = useState({
    years: 0,
    months: 0,
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })

  // Tarot game states
  const [selectedCard, setSelectedCard] = useState<(typeof tarotCards)[0] | null>(null)
  const [isCardRevealed, setIsCardRevealed] = useState(false)
  const [isShuffling, setIsShuffling] = useState(false)

  const audioRef = useRef<HTMLAudioElement>(null)
  const formRef = useRef<HTMLFormElement>(null)

  // Load EmailJS CDN
  useEffect(() => {
    const script = document.createElement("script")
    script.src = "https://cdn.jsdelivr.net/npm/emailjs-com@3/dist/email.min.js"
    script.onload = () => {
      // Initialize EmailJS with your public key
      window.emailjs.init("ULHZxMYqDRZY8X4QQ")
      setEmailjsLoaded(true)
    }
    document.head.appendChild(script)

    return () => {
      document.head.removeChild(script)
    }
  }, [])

  // Auto-play music when component mounts
  useEffect(() => {
    const playMusic = async () => {
      if (audioRef.current) {
        try {
          audioRef.current.volume = 0.3 // Set volume to 30%
          await audioRef.current.play()
        } catch (error) {
          console.log("Auto-play blocked, waiting for user interaction")
        }
      }
    }

    const timer = setTimeout(playMusic, 1000)
    return () => clearTimeout(timer)
  }, [])

  // Calculate life time from birth date
  useEffect(() => {
    const birthDate = new Date("2005-07-06T00:00:00") // 6 Juli 2005

    const updateLifeTime = () => {
      const now = new Date()
      const diff = now.getTime() - birthDate.getTime()

      if (diff > 0) {
        const years = Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000))
        const months = Math.floor((diff % (365.25 * 24 * 60 * 60 * 1000)) / (30.44 * 24 * 60 * 60 * 1000))
        const days = Math.floor((diff % (30.44 * 24 * 60 * 60 * 1000)) / (24 * 60 * 60 * 1000))
        const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000))
        const minutes = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000))
        const seconds = Math.floor((diff % (60 * 1000)) / 1000)

        setLifeTime({ years, months, days, hours, minutes, seconds })
      }
    }

    updateLifeTime()
    const interval = setInterval(updateLifeTime, 1000)

    return () => clearInterval(interval)
  }, [])

  // Tarot card game functions
  const shuffleAndPickCard = () => {
    setIsShuffling(true)
    setIsCardRevealed(false)
    setSelectedCard(null)

    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * tarotCards.length)
      setSelectedCard(tarotCards[randomIndex])
      setIsShuffling(false)

      setTimeout(() => {
        setIsCardRevealed(true)
      }, 500)
    }, 2000)
  }

  const resetTarotGame = () => {
    setSelectedCard(null)
    setIsCardRevealed(false)
    setIsShuffling(false)
  }

  const slides = [
    {
      id: 1,
      title: "Happy Birthday, Adel! 🎂",
      message:
        "Seperti kartu tarot yang membuka misteri masa depan, hari ini membuka chapter baru dalam hidupmu. Semoga setiap langkah yang kamu ambil membawa keajaiban dan keberuntungan.",
      bgGradient: "from-purple-900 via-indigo-900 to-violet-900",
      icon: <Cake className="w-16 h-16 text-white" />,
      animation: "animate-bounce",
    },
    {
      id: 2,
      title: "The Fool's Journey 🌙",
      message:
        "Kamu seperti The Fool dalam tarot - berani memulai perjalanan baru dengan hati yang penuh harapan. Setiap tahun adalah kartu baru yang dibuka, penuh dengan kemungkinan tak terbatas.",
      bgGradient: "from-slate-900 via-purple-900 to-indigo-900",
      icon: <Moon className="w-16 h-16 text-white" />,
      animation: "animate-pulse",
    },
    {
      id: 3,
      title: "Reading Your Stars ⭐",
      message:
        "Bintang-bintang berbisik tentang masa depanmu yang cerah. Seperti lagu Feast yang mengatakan tentang tarot, kadang kita butuh sedikit magic untuk percaya pada diri sendiri.",
      bgGradient: "from-indigo-900 via-blue-900 to-purple-900",
      icon: <Star className="w-16 h-16 text-white" />,
      animation: "animate-spin",
    },
    {
      id: 4,
      title: "The Magician Within 🔮",
      message:
        "Adel, kamu punya kekuatan untuk menciptakan realitasmu sendiri. Seperti The Magician dalam tarot, semua tools yang kamu butuhkan sudah ada dalam dirimu. Percayalah pada intuisimu.",
      bgGradient: "from-violet-900 via-purple-900 to-pink-900",
      icon: <Gift className="w-16 h-16 text-white" />,
      animation: "animate-bounce",
    },
    {
      id: 5,
      title: "Love & The Empress 💜",
      message:
        "Seperti The Empress yang melambangkan cinta dan kelimpahan, semoga hidupmu dipenuhi dengan kasih sayang dari orang-orang terkasih. Kamu layak mendapatkan semua kebahagiaan di dunia.",
      bgGradient: "from-pink-900 via-rose-900 to-purple-900",
      icon: <Heart className="w-16 h-16 text-white" />,
      animation: "animate-pulse",
    },
    {
      id: 6,
      title: "The World Awaits ✨",
      message:
        "Kartu terakhir dalam Major Arcana adalah The World - pencapaian dan kesempurnaan. Di usia ini, kamu sudah menunjukkan betapa luar biasanya dirimu. Keep shining, Adel!",
      bgGradient: "from-indigo-900 via-violet-900 to-purple-900",
      icon: <Sparkles className="w-16 h-16 text-white" />,
      animation: "animate-spin",
    },
  ]

  const totalSlides = slides.length + 2 // +1 for tarot game, +1 for wish form

  const nextSlide = () => {
    if (!isAnimating) {
      setIsAnimating(true)
      setCurrentSlide((prev) => (prev + 1) % totalSlides)
      setTimeout(() => setIsAnimating(false), 500)
    }
  }

  const prevSlide = () => {
    if (!isAnimating) {
      setIsAnimating(true)
      setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides)
      setTimeout(() => setIsAnimating(false), 500)
    }
  }

  const goToSlide = (index: number) => {
    if (!isAnimating && index !== currentSlide) {
      setIsAnimating(true)
      setCurrentSlide(index)
      setTimeout(() => setIsAnimating(false), 500)
    }
  }

  const handleSubmitWish = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!emailjsLoaded || !window.emailjs) {
      setSubmitStatus("error")
      return
    }

    setIsSubmitting(true)
    setSubmitStatus("idle")

    if (!formRef.current) {
      setSubmitStatus("error")
      setIsSubmitting(false)
      return
    }

    try {
      const result = await window.emailjs.sendForm("service_ydyzj2q", "template_2me352f", formRef.current)

      setSubmitStatus("success")
      formRef.current.reset()
    } catch (error) {
      console.error("Error sending wish:", error)
      setSubmitStatus("error")
    } finally {
      setIsSubmitting(false)
    }
  }

  const isTarotGameSlide = currentSlide === slides.length
  const isWishFormSlide = currentSlide === slides.length + 1
  const currentSlideData = isTarotGameSlide || isWishFormSlide ? null : slides[currentSlide]

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 relative overflow-hidden">
      {/* Background Music - Hidden */}
      <audio ref={audioRef} loop preload="auto" style={{ display: "none" }}>
        <source src="/feast-tarot.mp3" type="audio/mpeg" />
        <source src="/feast-tarot.ogg" type="audio/ogg" />
        Your browser does not support the audio element.
      </audio>

      {/* Life Time Counter */}
      <div className="fixed top-4 left-4 z-50 bg-purple-900/30 backdrop-blur-sm rounded-lg p-4 text-purple-100 border border-purple-700/30">
        <div className="text-center mb-2">
          <div className="text-xs text-purple-200/70 mb-1">🔮 Mystical Journey</div>
          <div className="text-xs text-purple-200/60">Since July 6, 2005</div>
        </div>

        <div className="space-y-1 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-purple-200/80">Years:</span>
            <span className="font-mono text-purple-100 font-bold">{lifeTime.years}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-purple-200/80">Months:</span>
            <span className="font-mono text-purple-100 font-bold">{lifeTime.months}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-purple-200/80">Days:</span>
            <span className="font-mono text-purple-100 font-bold">{lifeTime.days}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-purple-200/80">Hours:</span>
            <span className="font-mono text-purple-100 font-bold">{lifeTime.hours}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-purple-200/80">Minutes:</span>
            <span className="font-mono text-purple-100 font-bold">{lifeTime.minutes}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-purple-200/80">Seconds:</span>
            <span className="font-mono text-purple-100 font-bold animate-pulse">{lifeTime.seconds}</span>
          </div>
        </div>

        <div className="mt-2 pt-2 border-t border-purple-700/30 text-center">
          <div className="text-xs text-purple-200/60">🌙 Live Reading</div>
        </div>
      </div>

      {/* Animated Mystical Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating tarot cards */}
        <div className="tarot-card card-1">🃏</div>
        <div className="tarot-card card-2">🂠</div>
        <div className="tarot-card card-3">🃏</div>
        <div className="tarot-card card-4">🂠</div>
        <div className="tarot-card card-5">🃏</div>
        <div className="tarot-card card-6">🂠</div>

        {/* Crystal balls and mystical elements */}
        <div className="mystical crystal-1">🔮</div>
        <div className="mystical crystal-2">🌙</div>
        <div className="mystical crystal-3">⭐</div>
        <div className="mystical crystal-4">🔮</div>

        {/* Magical sparkles */}
        <div className="magic-sparkle sparkle-1">✨</div>
        <div className="magic-sparkle sparkle-2">💫</div>
        <div className="magic-sparkle sparkle-3">🌟</div>
        <div className="magic-sparkle sparkle-4">✨</div>
        <div className="magic-sparkle sparkle-5">💫</div>
        <div className="magic-sparkle sparkle-6">🌟</div>

        {/* Constellation patterns */}
        <div className="constellation constellation-1">
          <div className="star"></div>
          <div className="star"></div>
          <div className="star"></div>
        </div>
        <div className="constellation constellation-2">
          <div className="star"></div>
          <div className="star"></div>
          <div className="star"></div>
        </div>
      </div>

      <div className="relative w-full max-w-2xl z-10">
        {/* Main Card */}
        <Card className="relative overflow-hidden border-0 shadow-2xl backdrop-blur-sm bg-purple-950/20 border border-purple-700/30">
          <CardContent className="p-0">
            {isTarotGameSlide ? (
              // Tarot Game Slide
              <div className="relative h-auto bg-gradient-to-br from-indigo-800 via-purple-900 to-violet-900 p-8 text-center">
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute top-4 left-4 w-8 h-8 border-2 border-purple-200 rounded-full animate-spin"></div>
                  <div className="absolute top-8 right-8 w-6 h-6 border-2 border-purple-200 rounded-full animate-ping"></div>
                  <div className="absolute bottom-8 left-8 w-4 h-4 bg-purple-200 rounded-full animate-bounce"></div>
                  <div className="absolute bottom-4 right-4 w-10 h-10 border-2 border-purple-200 rounded-full animate-pulse"></div>
                </div>

                <div className="relative z-10">
                  <div className="mb-6 animate-bounce">
                    <div className="text-6xl">🔮</div>
                  </div>

                  <h1 className="text-3xl md:text-4xl font-bold text-purple-100 mb-4 animate-fade-in">
                    Tarot Reading untuk Adel 🃏
                  </h1>

                  <p className="text-lg text-purple-200/90 mb-6 animate-slide-up">
                    Pilih sebuah kartu dan lihat apa yang alam semesta katakan tentang perjalanan hidupmu!
                  </p>

                  <div className="space-y-6">
                    {!selectedCard && !isShuffling && (
                      <Button
                        onClick={shuffleAndPickCard}
                        className="bg-purple-800/50 hover:bg-purple-700/60 text-purple-100 border border-purple-600/50 transition-all duration-300 hover:scale-105 px-8 py-3"
                      >
                        <Shuffle className="w-5 h-5 mr-2" />
                        Kocok & Pilih Kartu
                      </Button>
                    )}

                    {isShuffling && (
                      <div className="flex flex-col items-center space-y-4">
                        <div className="text-4xl animate-spin">🃏</div>
                        <p className="text-purple-200 animate-pulse">Mengocok kartu...</p>
                      </div>
                    )}

                    {selectedCard && !isCardRevealed && (
                      <div className="flex flex-col items-center space-y-4">
                        <div className="w-32 h-48 bg-purple-800/50 border-2 border-purple-600/50 rounded-lg flex items-center justify-center animate-pulse">
                          <div className="text-4xl">🂠</div>
                        </div>
                        <p className="text-purple-200">Membuka kartu...</p>
                      </div>
                    )}

                    {selectedCard && isCardRevealed && (
                      <div className="flex flex-col items-center space-y-4 animate-fade-in">
                        <div className="w-32 h-48 bg-gradient-to-b from-purple-700 to-indigo-800 border-2 border-gold-400 rounded-lg flex flex-col items-center justify-center p-4 shadow-2xl">
                          <div className="text-4xl mb-2">{selectedCard.emoji}</div>
                          <div className="text-purple-100 text-sm font-bold text-center">{selectedCard.name}</div>
                        </div>

                        <div className="max-w-md text-center">
                          <h3 className="text-xl font-bold text-purple-100 mb-2">{selectedCard.name}</h3>
                          <p className="text-purple-200/90 text-sm leading-relaxed">{selectedCard.meaning}</p>
                        </div>

                        <Button
                          onClick={resetTarotGame}
                          className="bg-purple-700/50 hover:bg-purple-600/60 text-purple-100 border border-purple-500/50 transition-all duration-300 hover:scale-105 mt-4"
                        >
                          <Shuffle className="w-4 h-4 mr-2" />
                          Pilih Kartu Lain
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="absolute top-6 left-6">
                  <Heart className="w-4 h-4 text-purple-300/60 animate-pulse" />
                </div>
                <div className="absolute bottom-6 right-6">
                  <Star className="w-5 h-5 text-purple-300/60 animate-spin" />
                </div>
              </div>
            ) : isWishFormSlide ? (
              // Wish Form Slide
              <div className="relative h-auto bg-gradient-to-br from-purple-800 via-indigo-900 to-violet-900 p-8 text-center">
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute top-4 left-4 w-8 h-8 border-2 border-purple-200 rounded-full animate-spin"></div>
                  <div className="absolute top-8 right-8 w-6 h-6 border-2 border-purple-200 rounded-full animate-ping"></div>
                  <div className="absolute bottom-8 left-8 w-4 h-4 bg-purple-200 rounded-full animate-bounce"></div>
                  <div className="absolute bottom-4 right-4 w-10 h-10 border-2 border-purple-200 rounded-full animate-pulse"></div>
                </div>

                <div className="relative z-10">
                  <div className="mb-6 animate-bounce">
                    <Mail className="w-16 h-16 text-purple-100 mx-auto" />
                  </div>

                  <h1 className="text-3xl md:text-4xl font-bold text-purple-100 mb-4 animate-fade-in">
                    Send Wishes to Adel 🔮
                  </h1>

                  <p className="text-lg text-purple-200/90 mb-6 animate-slide-up">
                    Tuliskan harapan dan doa terbaikmu untuk Adel!
                  </p>

                  <form ref={formRef} onSubmit={handleSubmitWish} className="space-y-4 text-left max-w-md mx-auto">
                    <div>
                      <Label htmlFor="from_name" className="text-purple-100 font-medium">
                        Nama Kamu
                      </Label>
                      <Input
                        id="from_name"
                        name="from_name"
                        type="text"
                        required
                        className="mt-1 bg-purple-950/30 border-purple-700/50 text-purple-100 placeholder:text-purple-300/70 focus:bg-purple-950/50"
                        placeholder="Masukkan nama kamu..."
                      />
                    </div>

                    <div>
                      <Label htmlFor="message" className="text-purple-100 font-medium">
                        Pesan untuk Adel
                      </Label>
                      <Textarea
                        id="message"
                        name="message"
                        required
                        rows={4}
                        className="mt-1 bg-purple-950/30 border-purple-700/50 text-purple-100 placeholder:text-purple-300/70 focus:bg-purple-950/50 resize-none"
                        placeholder="Tuliskan pesan dan harapan terbaikmu untuk Adel..."
                      />
                    </div>

                    <input type="hidden" name="to_email" value="wishcometruemagic@gmail.com" />

                    <Button
                      type="submit"
                      disabled={isSubmitting || !emailjsLoaded}
                      className="w-full bg-purple-800/50 hover:bg-purple-700/60 text-purple-100 border border-purple-600/50 transition-all duration-300 hover:scale-105 disabled:opacity-50"
                    >
                      {!emailjsLoaded ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-100 mr-2"></div>
                          Memuat...
                        </>
                      ) : isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-100 mr-2"></div>
                          Mengirim...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Kirim Pesan 🌙
                        </>
                      )}
                    </Button>

                    {submitStatus === "success" && (
                      <div className="text-center p-3 bg-green-800/30 border border-green-600/50 rounded-lg">
                        <p className="text-purple-100 font-medium">✨ Pesan terkirim! 🎉 ✨</p>
                        <p className="text-purple-200/80 text-sm">
                          Terima kasih telah berbagi harapan indah untuk Adel!
                        </p>
                      </div>
                    )}

                    {submitStatus === "error" && (
                      <div className="text-center p-3 bg-red-800/30 border border-red-600/50 rounded-lg">
                        <p className="text-purple-100 font-medium">❌ Gagal mengirim pesan</p>
                        <p className="text-purple-200/80 text-sm">Silakan coba lagi dalam beberapa saat.</p>
                      </div>
                    )}
                  </form>
                </div>

                <div className="absolute top-6 left-6">
                  <Heart className="w-4 h-4 text-purple-300/60 animate-pulse" />
                </div>
                <div className="absolute bottom-6 right-6">
                  <Moon className="w-5 h-5 text-purple-300/60 animate-spin" />
                </div>
              </div>
            ) : (
              // Regular Birthday Card Slides
              <div
                className={`relative h-96 bg-gradient-to-br ${currentSlideData?.bgGradient} flex flex-col items-center justify-center text-center p-8 transition-all duration-500 ${isAnimating ? "scale-95 opacity-80" : "scale-100 opacity-100"}`}
              >
                {/* Animated background pattern */}
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute top-4 left-4 w-8 h-8 border-2 border-white rounded-full animate-spin"></div>
                  <div className="absolute top-8 right-8 w-6 h-6 border-2 border-white rounded-full animate-ping"></div>
                  <div className="absolute bottom-8 left-8 w-4 h-4 bg-white rounded-full animate-bounce"></div>
                  <div className="absolute bottom-4 right-4 w-10 h-10 border-2 border-white rounded-full animate-pulse"></div>
                </div>

                {/* Icon */}
                <div className={`mb-6 ${currentSlideData?.animation}`}>{currentSlideData?.icon}</div>

                {/* Title */}
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 animate-fade-in">
                  {currentSlideData?.title}
                </h1>

                {/* Message */}
                <p className="text-lg text-white/90 leading-relaxed max-w-md animate-slide-up">
                  {currentSlideData?.message}
                </p>

                {/* Decorative elements */}
                <div className="absolute top-6 left-6">
                  <Heart className="w-4 h-4 text-white/60 animate-pulse" />
                </div>
                <div className="absolute bottom-6 right-6">
                  <Star className="w-5 h-5 text-white/60 animate-spin" />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <Button
          variant="outline"
          size="icon"
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-purple-900/30 border-purple-700/50 text-purple-100 hover:bg-purple-800/40 backdrop-blur-sm transition-all duration-300 hover:scale-110"
          onClick={prevSlide}
          disabled={isAnimating}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-purple-900/30 border-purple-700/50 text-purple-100 hover:bg-purple-800/40 backdrop-blur-sm transition-all duration-300 hover:scale-110"
          onClick={nextSlide}
          disabled={isAnimating}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>

        {/* Slide Indicators */}
        <div className="flex justify-center mt-6 space-x-2">
          {Array.from({ length: totalSlides }).map((_, index) => (
            <button
              key={index}
              className={`w-3 h-3 rounded-full transition-all duration-300 hover:scale-125 ${
                index === currentSlide ? "bg-purple-300 scale-125 shadow-lg" : "bg-purple-500/50 hover:bg-purple-400/70"
              }`}
              onClick={() => goToSlide(index)}
            />
          ))}
        </div>

        {/* Slide Counter */}
        <div className="text-center mt-4">
          <span className="text-purple-200/70 text-sm bg-purple-900/30 px-3 py-1 rounded-full backdrop-blur-sm border border-purple-700/30">
            {currentSlide + 1} / {totalSlides}
          </span>
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes float-mystical {
          0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.7; }
          50% { transform: translateY(-40px) rotate(15deg); opacity: 1; }
        }

        @keyframes card-flip {
          0% { transform: rotateY(0deg) scale(1); }
          50% { transform: rotateY(90deg) scale(1.1); }
          100% { transform: rotateY(0deg) scale(1); }
        }

        @keyframes mystical-glow {
          0%, 100% { opacity: 0.5; transform: scale(1) rotate(0deg); }
          50% { opacity: 1; transform: scale(1.2) rotate(180deg); }
        }

        @keyframes constellation-twinkle {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }

        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
        
        .animate-slide-up {
          animation: slide-up 1s ease-out 0.3s both;
        }

        .tarot-card {
          position: absolute;
          font-size: 2.5rem;
          animation: card-flip 8s ease-in-out infinite;
          opacity: 0.8;
        }

        .card-1 { top: 10%; left: 15%; animation-delay: 0s; }
        .card-2 { top: 30%; right: 10%; animation-delay: 2s; }
        .card-3 { bottom: 25%; left: 10%; animation-delay: 4s; }
        .card-4 { bottom: 15%; right: 20%; animation-delay: 6s; }
        .card-5 { top: 60%; left: 5%; animation-delay: 8s; }
        .card-6 { top: 20%; right: 30%; animation-delay: 10s; }

        .mystical {
          position: absolute;
          font-size: 2rem;
          animation: mystical-glow 6s ease-in-out infinite;
        }

        .crystal-1 { top: 25%; left: 70%; animation-delay: 0s; }
        .crystal-2 { bottom: 40%; left: 20%; animation-delay: 2s; }
        .crystal-3 { top: 70%; right: 15%; animation-delay: 4s; }
        .crystal-4 { bottom: 20%; right: 60%; animation-delay: 6s; }

        .magic-sparkle {
          position: absolute;
          font-size: 1.5rem;
          color: #a855f7;
          animation: float-mystical 5s ease-in-out infinite;
        }

        .magic-sparkle.sparkle-1 { top: 15%; left: 40%; animation-delay: 0s; }
        .magic-sparkle.sparkle-2 { top: 80%; right: 40%; animation-delay: 1s; }
        .magic-sparkle.sparkle-3 { bottom: 30%; left: 60%; animation-delay: 2s; }
        .magic-sparkle.sparkle-4 { top: 50%; right: 20%; animation-delay: 3s; }
        .magic-sparkle.sparkle-5 { bottom: 60%; left: 80%; animation-delay: 4s; }
        .magic-sparkle.sparkle-6 { top: 35%; right: 70%; animation-delay: 5s; }

        .constellation {
          position: absolute;
          width: 100px;
          height: 100px;
        }

        .constellation-1 { top: 20%; left: 60%; }
        .constellation-2 { bottom: 30%; right: 30%; }

        .star {
          position: absolute;
          width: 3px;
          height: 3px;
          background: #fbbf24;
          border-radius: 50%;
          animation: constellation-twinkle 3s ease-in-out infinite;
        }

        .constellation-1 .star:nth-child(1) { top: 10px; left: 20px; animation-delay: 0s; }
        .constellation-1 .star:nth-child(2) { top: 40px; left: 60px; animation-delay: 1s; }
        .constellation-1 .star:nth-child(3) { top: 70px; left: 30px; animation-delay: 2s; }

        .constellation-2 .star:nth-child(1) { top: 20px; left: 40px; animation-delay: 0.5s; }
        .constellation-2 .star:nth-child(2) { top: 50px; left: 10px; animation-delay: 1.5s; }
        .constellation-2 .star:nth-child(3) { top: 80px; left: 70px; animation-delay: 2.5s; }
      `}</style>
    </div>
  )
}
