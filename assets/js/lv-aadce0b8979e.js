(function(){const root=window.document.getElementById("lv-aadce0b8979e");if(!root)return;const document=window.lvScopedDocument(root);

    (function(){
        // Point central Hôtel
        const home = { name: "Le Grimaldi — Cagnes-sur-Mer", lat: 43.6679, lng: 7.1464 };
        
        // Liste sous la carte
        const listPlaces = [
            { name: "Cagnes-sur-Mer", category: "Centre-village", distOverride: "450m", lat: 43.6679, lng: 7.1464 },
            { name: "Plage Le Neptune", category: "Plage", distOverride: "1,9km", lat: 43.6539, lng: 7.1509 },
            { name: "Nice", category: "Ville", lat: 43.7102, lng: 7.2620 },
            { name: "Antibes", category: "Ville", lat: 43.5804, lng: 7.1251 },
            { name: "Cannes", category: "Ville", lat: 43.5528, lng: 7.0174 },
            { name: "Monaco", category: "Ville", lat: 43.7384, lng: 7.4246 }
        ];

        // Points sur la carte
        const poi = [
            { name:"Promenade des Anglais", category:"Nice", type:"spot", lat:43.6957, lng:7.2650 },
            { name:"Vieux-Nice & Cours Saleya", category:"Nice", type:"spot", lat:43.6959, lng:7.2763 },
            { name:"La Croisette", category:"Cannes", type:"spot", lat:43.5518, lng:7.0239 },
            { name:"Palais des Festivals", category:"Cannes", type:"spot", lat:43.5525, lng:7.0176 },
            { name:"Casino de Monte-Carlo", category:"Monaco", type:"spot", lat:43.7392, lng:7.4276 },
            { name:"Palais Princier", category:"Monaco", type:"spot", lat:43.7311, lng:7.4207 },
            { name:"Cap d’Antibes", category:"Antibes", type:"spot", lat:43.5526, lng:7.1294 },
            { name:"Saint-Paul-de-Vence", category:"Village", type:"spot", lat:43.6978, lng:7.1223 },
            { name:"Èze Village", category:"Village", type:"spot", lat:43.7271, lng:7.3617 },
            { name:"Menton (vieille ville)", category:"Menton", type:"spot", lat:43.7766, lng:7.5050 }
        ];

        // Calcul distance
        function toRad(x){ return x * Math.PI / 180; }
        function haversineMeters(a, b){
            const R = 6371000;
            const dLat = toRad(b.lat - a.lat);
            const dLng = toRad(b.lng - a.lng);
            const s1 = Math.sin(dLat/2), s2 = Math.sin(dLng/2);
            const c = s1*s1 + Math.cos(toRad(a.lat))*Math.cos(toRad(b.lat))*s2*s2;
            return 2 * R * Math.asin(Math.min(1, Math.sqrt(c)));
        }
        function formatDist(m){
            if (m < 1000) return Math.round(m/10)*10 + "m";
            const km = m / 1000;
            return km.toFixed(1).replace(".", ",") + "km";
        }

        // Génération de la grille HTML pour les lieux
        const grid = document.getElementById("lvNearbyGrid");
        if (grid){
            grid.innerHTML = listPlaces.map(p => {
                const dist = p.distOverride ? p.distOverride : formatDist(haversineMeters(home, p));
                return `
                    <div class="flex items-center justify-between border-b border-village-dark/10 pb-3">
                        <div class="flex flex-col">
                            <span class="font-serif text-lg text-village-dark">${p.name}</span>
                            <span class="font-sans text-[11px] uppercase tracking-widest text-village-dark/50">${p.category}</span>
                        </div>
                        <span class="font-sans text-sm font-semibold text-village-accent">${dist}</span>
                    </div>
                `;
            }).join("");
        }

        // Gestion de la modale Map
        const modal = document.getElementById("lvMapModal");
        const openBtn = document.getElementById("lvOpenMap");
        const closeBtn = document.getElementById("lvCloseMap");

        function openModal(){
            modal.classList.add("lv-open");
            modal.setAttribute("aria-hidden", "false");
            document.body.style.overflow = "hidden";
            setTimeout(() => {
                initMapOnce();
                map.invalidateSize();
                fit06();
            }, 100); 
        }
        function closeModal(){
            modal.classList.remove("lv-open");
            modal.setAttribute("aria-hidden", "true");
            document.body.style.overflow = "";
        }

        openBtn && openBtn.addEventListener("click", openModal);
        closeBtn && closeBtn.addEventListener("click", closeModal);
        modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });
        window.addEventListener("keydown", (e) => { if (e.key === "Escape" && modal.classList.contains("lv-open")) closeModal(); });

        // Pictos Map
        const SVG_PIN = `<svg viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>`;
        
        function pinIcon(kind, title){
            const cls = kind === "main" ? "lv-pin main" : "lv-pin";
            const html = `<div class="${cls}" title="${title}">${SVG_PIN}</div>`;
            return L.divIcon({ className:"", html, iconSize:[34,34], iconAnchor:[17,34], popupAnchor:[0,-34] });
        }

        // Initialisation Leaflet
        let map, basePlan, baseSat, markersGroup;
        const tabPlan = document.getElementById("lvTabPlan");
        const tabSat = document.getElementById("lvTabSat");

        function setActiveTab(which){
            if(tabPlan) {
                tabPlan.style.color = which === 'plan' ? '#9d623d' : 'rgba(113, 53, 6, 0.5)';
            }
            if(tabSat) {
                tabSat.style.color = which === 'sat' ? '#9d623d' : 'rgba(113, 53, 6, 0.5)';
            }
        }

        function initMapOnce(){
            if (map) return;
            map = L.map("lvLeafletMap", { zoomControl: false, scrollWheelZoom: true });
            L.control.zoom({ position: 'bottomright' }).addTo(map);

            basePlan = L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
                attribution: "© OpenStreetMap © CARTO",
                maxZoom: 19
            });
            baseSat = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
                attribution: "Tiles © Esri",
                maxZoom: 19
            });

            basePlan.addTo(map);
            setActiveTab("plan");

            markersGroup = L.featureGroup().addTo(map);

            // Marqueur Hôtel
            L.marker([home.lat, home.lng], { icon: pinIcon("main", home.name) })
                .addTo(markersGroup)
                .bindPopup(`<div style="font-family:'Playfair Display',serif; font-size:16px; color:#713506;"><strong>${home.name}</strong></div>`);

            // Marqueurs POI
            poi.forEach(p => {
                L.marker([p.lat, p.lng], { icon: pinIcon("spot", p.name) })
                .addTo(markersGroup)
                .bindPopup(`<div style="font-family:'Lato',sans-serif; font-size:14px; color:#713506;"><strong>${p.name}</strong><br><span style="opacity:.6; font-size:11px; text-transform:uppercase; letter-spacing:1px;">${p.category}</span></div>`);
            });

            tabPlan && tabPlan.addEventListener("click", () => {
                map.removeLayer(baseSat);
                basePlan.addTo(map);
                setActiveTab("plan");
            });
            tabSat && tabSat.addEventListener("click", () => {
                map.removeLayer(basePlan);
                baseSat.addTo(map);
                setActiveTab("sat");
            });
        }

        function fit06(){
            const bounds06 = L.latLngBounds(
                L.latLng(43.5, 6.9),
                L.latLng(43.8, 7.5)
            );
            map.fitBounds(bounds06, { padding: [40, 40] });
        }
    })();

})();