// src/@core/layouts/components/menu/vertical-menu/VerticalNavMenuItems.js
import React from "react";

// ** Vertical Menu Components
import VerticalNavMenuLink from "./VerticalNavMenuLink";
import VerticalNavMenuGroup from "./VerticalNavMenuGroup";

const VerticalNavMenuItems = (props) => {
  // ** Props
  const { items } = props;

  // ** Resolve component type
  const resolveNavItemComponent = (item) => {
    if (item.children && item.children.length) {
      return "VerticalNavMenuGroup";
    }
    return "VerticalNavMenuLink";
  };

  // ** Components Object
  const Components = {
    VerticalNavMenuLink,
    VerticalNavMenuGroup,
  };

  // ** Render Nav Menu Items
  const RenderNavItems = items.map((item, index) => {
    const TagName = Components[resolveNavItemComponent(item)];
    
    return (
      <TagName 
        key={item.id || `nav-item-${index}`} 
        item={item} 
        {...props} 
      />
    );
  });

  return <>{RenderNavItems}</>;
};

export default VerticalNavMenuItems;