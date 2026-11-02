// Sources publiques vérifiées : vrais portraits de monstres, pas des captures de fiches.
// Les autres Henchs utilisent pour l'instant leur asset local quand il existe.
window.HENCHBOUND_PORTRAIT_OVERRIDES = {
  "Draco": "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhgHCcCqCpEuLR-g8AnYwLNVKh_8Hmd_hsIUcDQee3QboXSWm36jG23jZKRgeC53fv5p2CrrVpBm2Qfy2MkRvFI7eO5cJyaiaLYsqYvfpfdI5u9M9FJ-iqZpjE60LerIj4SC0ODsXikjIY/s44/01_monster001.gif",
  "Devilco": "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhctSO7Ut4RlMDlybp5mgnWTvIwn2WrcWPNMThwc9JDEEQk0TLdOpck1XaUq5kVbZQs24tCvbexIJ84ACYv1VFT1FStwsMUWrbWW0zEW8nljyU01jLEu882wcPT-qvimzmQDDsFvuGW0/s45/01_monster002.gif",
  "Beasco": "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjAYCXcRsw3sUsZIXY0Q1sd5onIk2HMbnfLFVMINbxOt9JdsB0jZ1T0acnBUZ0O3qhpzwNPdtOmEXPVZE6Zj-ztuJAuvE_jcnBXLh2VzDC88HsrgxmQOqtbkQY5asltbMkhpSLEwfwcs/s44/01_monster003.gif",
  "Birdco": "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEi73ySpo7iZtKlAQtfr0pDK7M8Ih8W8WyryUiMu7kWAS__gTCdiHYmC9AwK0AKre9dPH4EgR1IfRfNnL79_476xMxnW3GUZgcfVW20bRRjq5wFH20RsmtzQitk-7RTs4iAmrSUBWhEdQOA/s1600/01_monster004.gif",
  "Inseco": "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhSbeFP1cV_qFvlAsIAijXZuD_wNOKev8GICxqAZ6QnKFYCPmHWp6s86mQq8t6mgr0yUxGA92r5PfnMGlbm0yVw-FbGqY2AiLGhy7L_UNEZF1O3mj6DycmehF_4MxIzVrwv6ufQ7nrRzy0/s45/01_monster005.gif",
  "Flowco": "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiQqryxiy8532d4NZ6aU-qlmwMJ9zNcRNbOLeGLVSQnDRvV1hzsSEIJGZ2bbLF4zD7B9HPGZpUrBLFUxQr0Sp51jGwv8n6-dsYeyZ9GeRT_Tr70IsAUbXmdYarP5-Zn4Tc0xV0t_edVgN0/s1600/01_monster006.gif",
  "Mysco": "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgeiAnG2Gx08hipr63saYsJZdLR0Z5XGnTt54un_gcsotxuzmPCnKjz6DEVkjWeW-oSe0TNreHoWa4kUdLljZxwc8R04Y39TQ6MbmKvq1VALey5UdmZB3LubmBxWd1ZKwaK6t96zs9kB9o/s1600/01_monster007.gif",
  "Rurabbi": "https://i.imgur.com/CYTrZl9.png",
  "Bebe": "https://i.imgur.com/P4wATWU.png",
  "Buma": "https://i.imgur.com/2V1MK0G.png",
  "PoochDev": "https://i.imgur.com/fjA2Mxp.png"
};

function applyPortraitOverrides(root = document) {
  const map = window.HENCHBOUND_PORTRAIT_OVERRIDES || {};
  root.querySelectorAll("img[alt]").forEach(img => {
    const src = map[img.alt];
    if (src && img.src !== src) img.src = src;
  });
}

applyPortraitOverrides();
new MutationObserver(() => applyPortraitOverrides()).observe(document.body, { childList: true, subtree: true });
