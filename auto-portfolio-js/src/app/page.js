'use client';
import React, { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic'; // Import dynamic
import { motion, useScroll, useTransform } from 'framer-motion';
import { Github, Linkedin, Twitter, Mail, ExternalLink, Star } from 'lucide-react';
import { TypeAnimation } from 'react-type-animation';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { cn } from '@/lib/utils';

// Dynamically import SkillChart to prevent SSR issues with recharts
const SkillChart = dynamic(() => import('../components/SkillChart'), { 
    ssr: false,
    loading: () => <div className="h-[200px] w-full flex items-center justify-center"><p>Loading chart...</p></div>
});


// Background component with animated grid
const AnimatedBackground = () => (
  <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]">
    <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-fuchsia-400 opacity-20 blur-[100px]"></div>
  </div>
);

// Project Card with 3D tilt effect
const ProjectCard = ({ repo }) => {
    const ref = useRef(null);
    const [rotateX, setRotateX] = useState(0);
    const [rotateY, setRotateY] = useState(0);

    const handleMouseMove = (e) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const xPct = mouseX / width - 0.5;
        const yPct = mouseY / height - 0.5;
        setRotateX(yPct * -14);
        setRotateY(xPct * 14);
    };

    const handleMouseLeave = () => {
        setRotateX(0);
        setRotateY(0);
    };

    return (
        <motion.div
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
                transformStyle: "preserve-3d",
                transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
            }}
            className="relative flex-shrink-0"
        >
            <Card className="w-full max-w-sm h-[420px] bg-card/60 backdrop-blur-sm border-white/10 rounded-2xl shadow-lg flex flex-col justify-between transition-all duration-300 ease-out">
                <div style={{ transform: "translateZ(50px)" }} className="absolute inset-4 rounded-xl bg-card/80 shadow-inner" />
                <CardHeader className="z-10">
                    <div className="flex justify-between items-center">
                        <CardTitle className="text-2xl font-bold text-primary">{repo.name}</CardTitle>
                        <a href={repo.url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                            <ExternalLink size={20} />
                        </a>
                    </div>
                    <CardDescription className="h-12 overflow-hidden">{repo.description || repo.summary}</CardDescription>
                </CardHeader>
                <CardContent className="z-10 flex-grow flex flex-col justify-center items-center">
                    <SkillChart repo={repo} />
                </CardContent>
                <div className="z-10 p-6 pt-0 flex justify-between items-center text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <Star className="text-yellow-400" size={16} />
                        <span>{repo.stars}</span>
                    </div>
                    <span>{repo.language}</span>
                </div>
            </Card>
        </motion.div>
    );
};


export default function Home() {
  const [repos, setRepos] = useState([]);
  const [socials, setSocials] = useState({});
  const [error, setError] = useState(null);

  const scrollRef = useRef(null);
  const { scrollYProgress } = useScroll({ container: scrollRef });
  const scaleX = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  useEffect(() => {
    async function loadData() {
      try {
        const [repoRes, socialRes] = await Promise.all([
          fetch('/api/summary-data'),
          fetch('/api/socials'),
        ]);
        const repoData = await repoRes.json();
        const socialData = await socialRes.json();

        if (repoData && typeof repoData === 'object') {
          setRepos(Object.values(repoData).filter(repo => repo.visible !== false));
        } else {
          setError('Invalid summary data');
        }
        setSocials(socialData);
      } catch (err) {
        setError('Failed to load data');
        console.error(err);
      }
    }
    loadData();
  }, []);
  
  const socialIcons = {
    github: <Github />,
    linkedin: <Linkedin />,
    twitter: <Twitter />,
  };

  return (
    <div ref={scrollRef} className="h-screen w-full overflow-y-auto overflow-x-hidden snap-y snap-mandatory">
      <motion.div style={{ scaleX }} className="fixed top-0 left-0 right-0 h-1 bg-primary z-50" />
      <AnimatedBackground />

      {/* Hero Section */}
      <section id="home" className="h-screen w-full flex flex-col justify-center items-center text-center p-4 snap-start">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <img
            src="https://avatars.githubusercontent.com/u/119393675?v=4"
            alt="Sumit Bhagat"
            className="w-32 h-32 rounded-full border-4 border-primary/20 mb-6 shadow-2xl mx-auto"
          />
          <h1 className="text-5xl md:text-7xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400 bg-opacity-50">
            Sumit Bhagat
          </h1>
          <TypeAnimation
            sequence={[
              'A Full-Stack Developer.',
              2000,
              'A Cloud Enthusiast.',
              2000,
              'An Open-Source Contributor.',
              2000,
            ]}
            wrapper="p"
            speed={50}
            className="text-xl md:text-2xl text-muted-foreground mb-8"
            repeat={Infinity}
          />
          <div className="flex justify-center gap-4">
             <a href={socials.email}>
                <Button size="lg">
                    <Mail className="mr-2 h-4 w-4" /> Contact Me
                </Button>
             </a>
             <a href={socials.github} target="_blank" rel="noopener noreferrer">
                <Button size="lg" variant="outline">
                    <Github className="mr-2 h-4 w-4" /> GitHub
                </Button>
             </a>
          </div>
        </motion.div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="min-h-screen w-full flex flex-col justify-center items-center p-4 md:p-8 snap-start">
        <h2 className="text-4xl font-bold mb-4 text-center">My Work</h2>
        <p className="text-muted-foreground mb-12 text-center max-w-2xl">Here are some of the projects I've been working on. Hover over them for a little magic.</p>
        
        {error && <div className="text-destructive">{error}</div>}
        
        <div className="w-full overflow-x-auto pb-8 snap-x snap-mandatory">
            <motion.div 
                className="flex gap-8 px-8"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ staggerChildren: 0.2 }}
            >
                {repos.map((repo) => (
                    <ProjectCard key={repo.id || repo.name} repo={repo} />
                ))}
            </motion.div>
        </div>
      </section>

       {/* Contact Section */}
      <section id="contact" className="h-screen w-full flex flex-col justify-center items-center text-center p-4 snap-start">
        <h2 className="text-4xl font-bold mb-4">Let's Connect</h2>
        <p className="text-muted-foreground mb-8 max-w-lg">
          I'm currently looking for new opportunities. Whether you have a question or just want to say hi, I'll try my best to get back to you!
        </p>
        <div className="flex gap-6">
            {Object.entries(socials).map(([platform, url]) =>
              url && socialIcons[platform] ? (
                <a
                  key={platform}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                  aria-label={platform}
                >
                  {React.cloneElement(socialIcons[platform], { size: 32 })}
                </a>
              ) : null
            )}
        </div>
      </section>
    </div>
  );
}
