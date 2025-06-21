export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-100 to-purple-200">
      <section className="flex flex-col items-center text-center py-20 px-4">
        <h1 className="text-5xl font-extrabold text-purple-700 mb-4">
          Undangan Pernikahan Digital
        </h1>
        <p className="text-lg text-purple-600 mb-8 max-w-xl">
          Solusi modern dan mudah untuk mengundang tamu dengan RSVP, galeri, musik dan lebih.
        </p>
        <button className="bg-purple-600 text-white px-8 py-3 rounded-full hover:bg-purple-700 transition">
          Lihat Undangan
        </button>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 px-4">
          {["RSVP", "Guestbook", "Music", "Location"].map(item => (
            <div key={item} className="flex flex-col items-center">
              <div className="bg-purple-100 p-4 rounded-full mb-4">
                {/* Ganti dengan ikon asli */}
                <span className="text-purple-600 font-semibold">{item}</span>
              </div>
              <p className="text-gray-700 text-center">{item} membuat undangan lebih interaktif</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-16 bg-purple-50">
        <div className="max-w-3xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold text-purple-700 mb-6">Lebih dari 300+ template siap pakai</h2>
          <div className="flex justify-center space-x-6">
            <div><span className="text-4xl font-bold text-purple-600">2800+</span><p>Pasangan</p></div>
            <div><span className="text-4xl font-bold text-purple-600">300+</span><p>Template</p></div>
            <div><span className="text-4xl font-bold text-purple-600">24/7</span><p>Support</p></div>
          </div>
        </div>
      </section>
    </main>
)
}
