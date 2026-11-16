function linkEventSet(link: Element) {
  link.addEventListener("click", (e) => {
    e.preventDefault();

    const targetId = link.getAttribute("href")?.slice(1);
    const target = targetId && document.getElementById(targetId);

    if (!target) return;

    target.scrollIntoView({
      behavior: "smooth",
      block: target.offsetHeight < window.innerHeight ? "center" : "start",
    });
  });
}

export default function anchorLinkInit() {
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    linkEventSet(link);
  });
}
