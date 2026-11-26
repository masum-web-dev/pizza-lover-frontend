import { Button } from "@/components/ui/button"
import HeroSection from "./Components/HeroSection"
import WhyOurPizzaBest from "./Components/WhyOurPizzaBest"
import MostPopularDishes from "./Components/MostPopularDishes"
import WhyClientsChooseUs from "./Components/WhyClientsChooseUs"
import FastestDeliverySection from "./Components/FastestDeliverySection"

export default function Page() {
  return (
    <div>
    <HeroSection></HeroSection>
    <WhyOurPizzaBest></WhyOurPizzaBest>
    <MostPopularDishes></MostPopularDishes>
    <WhyClientsChooseUs></WhyClientsChooseUs>
    <FastestDeliverySection></FastestDeliverySection>
    </div>
  )
}
