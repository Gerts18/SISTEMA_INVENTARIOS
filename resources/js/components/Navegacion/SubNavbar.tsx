import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"

type ViewOption = {
  key: string
  label: string
}

interface InventarioNavHeaderProps {
  views: ViewOption[]
  currentView: string
  onChange: (view: string) => void
}

const SubNavBar = ({ views, currentView, onChange }: InventarioNavHeaderProps) => {
  return (
    <div className="flex justify-center">
      <NavigationMenu>
        <NavigationMenuList>
          {views.map((view) => (
            <NavigationMenuItem key={view.key}>
              <button
                type="button"
                onClick={() => onChange(view.key)}
              >
                <NavigationMenuLink
                  className={navigationMenuTriggerStyle() + (currentView === view.key ? " bg-muted" : "")}
                >
                  {view.label}
                </NavigationMenuLink>
              </button>
            </NavigationMenuItem>
          ))}
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  )
}

export default SubNavBar