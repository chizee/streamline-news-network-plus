'use client'

import Image from 'next/image'

export function TrustBar() {
  const userAvatars = [
    'https://i.pravatar.cc/150?img=12',
    'https://i.pravatar.cc/150?img=13',
    'https://i.pravatar.cc/150?img=14',
    'https://i.pravatar.cc/150?img=15',
    'https://i.pravatar.cc/150?img=16',
  ]

  return (
    <section className="py-12 px-6 bg-[#0a0e27]">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <p className="text-gray-400 mb-4">Trusted by 560+ content creators</p>
          
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="flex -space-x-2">
              {userAvatars.map((avatar, i) => (
                <Image
                  key={i}
                  src={avatar}
                  alt={`User ${i + 1}`}
                  width={40}
                  height={40}
                  className="rounded-full border-2 border-[#0a0e27]"
                />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-center gap-8 flex-wrap">
            {/* Stripe */}
            <div className="text-gray-400 flex items-center gap-2">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.594-7.305h.003z"/>
              </svg>
              <span>stripe</span>
            </div>

            {/* Airbnb */}
            <div className="text-gray-400 flex items-center gap-2">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C7.032 0 3 4.032 3 9c0 6.292 7.614 14.186 8.35 14.922a1.003 1.003 0 001.3 0C13.386 23.186 21 15.292 21 9c0-4.968-4.032-9-9-9zm0 12.75c-2.071 0-3.75-1.679-3.75-3.75S9.929 5.25 12 5.25s3.75 1.679 3.75 3.75-1.679 3.75-3.75 3.75z"/>
              </svg>
              <span>airbnb</span>
            </div>

            {/* Dropbox */}
            <div className="text-gray-400 flex items-center gap-2">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 1.807L0 5.629l6 3.822 6-3.822L6 1.807zM18 1.807l-6 3.822 6 3.822 6-3.822-6-3.822zM0 13.274l6 3.822 6-3.822-6-3.822L0 13.274zm12 0l6 3.822 6-3.822-6-3.822-6 3.822zM6 18.371l6 3.822 6-3.822-6-3.822-6 3.822z"/>
              </svg>
              <span>Dropbox</span>
            </div>

            {/* GitLab */}
            <div className="text-gray-400 flex items-center gap-2">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.955 13.587l-1.342-4.135-2.664-8.189a.455.455 0 00-.867 0L16.418 9.45H7.582L4.919 1.263a.455.455 0 00-.867 0L1.388 9.452.046 13.587a.924.924 0 00.331 1.023L12 23.054l11.623-8.443a.92.92 0 00.332-1.024"/>
              </svg>
              <span>GitLab</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
