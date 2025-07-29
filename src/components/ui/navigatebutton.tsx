"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type NavigateButtonProps = {
  label: string;
  route: string; 
};

const NavigateButton = ({ label, route }: NavigateButtonProps) => {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/${route}`); // ✅ Corrected here
  };

  return (
    <Button variant="outline" onClick={handleClick}>
      {label}
    </Button>
  );
};

export default NavigateButton;
