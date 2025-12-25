import React, { useState, useRef, useEffect, useMemo } from "react";
import { Link, useLocation } from "react-router";
import { Home, Briefcase, Calendar, Shield, Settings } from "lucide-react";

type IconComponentType = React.ElementType<{ className?: string }>;
export interface InteractiveMenuItem {
  label: string;
  icon: IconComponentType;
  to?: string; // Optional navigation path
}

export interface InteractiveMenuProps {
  items?: InteractiveMenuItem[];
  accentColor?: string;
  activeIndex?: number; // Optional controlled active index
  onItemClick?: (index: number, item: InteractiveMenuItem) => void; // Optional click handler
}

const defaultItems: InteractiveMenuItem[] = [
  { label: "home", icon: Home },
  { label: "strategy", icon: Briefcase },
  { label: "period", icon: Calendar },
  { label: "security", icon: Shield },
  { label: "settings", icon: Settings },
];

const defaultAccentColor = "var(--component-active-color-default)";

const InteractiveMenu: React.FC<InteractiveMenuProps> = ({
  items,
  accentColor,
  activeIndex: controlledActiveIndex,
  onItemClick,
}) => {
  const location = useLocation();
  const finalItems = useMemo(() => {
    const isValid =
      items && Array.isArray(items) && items.length >= 2 && items.length <= 5;
    if (!isValid) {
      console.warn(
        "InteractiveMenu: 'items' prop is invalid or missing. Using default items.",
        items
      );
      return defaultItems;
    }
    return items;
  }, [items]);

  const [internalActiveIndex, setInternalActiveIndex] = useState(0);

  // Determine active index from location if items have 'to' property
  const derivedActiveIndex = useMemo(() => {
    if (controlledActiveIndex !== undefined) {
      return controlledActiveIndex;
    }
    const hasNavigation = finalItems.some((item) => item.to);
    if (hasNavigation) {
      const index = finalItems.findIndex((item) => {
        if (!item.to) return false;
        return (
          location.pathname === item.to ||
          location.pathname.startsWith(item.to + "/")
        );
      });
      return index >= 0 ? index : 0;
    }
    return internalActiveIndex;
  }, [
    finalItems,
    location.pathname,
    controlledActiveIndex,
    internalActiveIndex,
  ]);

  const activeIndex = derivedActiveIndex;

  useEffect(() => {
    if (activeIndex >= finalItems.length) {
      setInternalActiveIndex(0);
    }
  }, [finalItems, activeIndex]);

  const textRefs = useRef<(HTMLElement | null)[]>([]);
  const itemRefs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const setLineWidth = () => {
      const activeItemElement = itemRefs.current[activeIndex];
      const activeTextElement = textRefs.current[activeIndex];

      if (activeItemElement && activeTextElement) {
        const textWidth = activeTextElement.offsetWidth;
        activeItemElement.style.setProperty("--lineWidth", `${textWidth}px`);
      }
    };

    setLineWidth();

    window.addEventListener("resize", setLineWidth);
    return () => {
      window.removeEventListener("resize", setLineWidth);
    };
  }, [activeIndex, finalItems]);

  const handleItemClick = (index: number, item: InteractiveMenuItem) => {
    setInternalActiveIndex(index);
    if (onItemClick) {
      onItemClick(index, item);
    }
  };

  const navStyle = useMemo(() => {
    const activeColor = accentColor || defaultAccentColor;
    return { "--component-active-color": activeColor } as React.CSSProperties;
  }, [accentColor]);

  return (
    <nav className="menu" role="navigation" style={navStyle}>
      {finalItems.map((item, index) => {
        const isActive = index === activeIndex;
        const isTextActive = isActive;

        const IconComponent = item.icon;

        const content = (
          <>
            <div className="menu__icon">
              <IconComponent className="icon" />
            </div>
            <strong
              className={`menu__text ${isTextActive ? "active" : ""}`}
              ref={(el) => {
                textRefs.current[index] = el;
              }}
            >
              {item.label}
            </strong>
          </>
        );

        // Use Link if 'to' is provided, otherwise use button
        if (item.to) {
          return (
            <Link
              key={item.label}
              to={item.to}
              className={`menu__item ${isActive ? "active" : ""}`}
              onClick={() => handleItemClick(index, item)}
              ref={(el) => {
                itemRefs.current[index] = el;
              }}
              style={{ "--lineWidth": "0px" } as React.CSSProperties}
            >
              {content}
            </Link>
          );
        }

        return (
          <button
            key={item.label}
            className={`menu__item ${isActive ? "active" : ""}`}
            onClick={() => handleItemClick(index, item)}
            ref={(el) => {
              itemRefs.current[index] = el;
            }}
            style={{ "--lineWidth": "0px" } as React.CSSProperties}
          >
            {content}
          </button>
        );
      })}
    </nav>
  );
};

export { InteractiveMenu };
