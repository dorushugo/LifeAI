"use client";
import Image from "next/image";
import { User } from "@/app/page";

export default function Sidebar({ user }: { user: User | null }) {
  return (
    <div 
      style={{ 
        backgroundColor: '#191919',
        width: '329px',
        padding: '56px 47px', // 56px haut/bas, 47px gauche/droite
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      {user?.gender === 'male' ? (
        <Image 
          src="/Homme-cercle.svg" 
          alt="Male avatar" 
          width={212} 
          height={212}
        
        />
      ) : (
        <Image 
          src="/Femme-cercle.svg" 
          alt="Female avatar" 
          width={212} 
          height={212}
        />
      )}

      <div className="text-center">
        <h1 className="text-[50px] text-[#F1F1F1]">
          {user?.gender === 'male' ? 'Roberto' : 'Roberta'}
        </h1>
        
        <p className="text-[40px] text-[#F1F1F1] -mt-[15px]">
          {user?.age} ans
        </p>
        
        <p className="text-[24px] text-[#F1F1F1] mt-[18px] pb-[61px]">
          {user?.gender === 'male' ? 'Homme' : 'Femme'}
        </p>
      </div>
    </div>
  );
}
