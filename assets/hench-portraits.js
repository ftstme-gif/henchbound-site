// HD portraits supplied for the current Henchbound bestiary batch (050–059).
window.HENCHBOUND_DATA.bestiary.forEach(item => {
  const portraits = {
    "050": "data:image/webp;base64,UklGR...PLACEHOLDER...",
  };
  if (portraits[item.id]) item.portrait = portraits[item.id];
});
