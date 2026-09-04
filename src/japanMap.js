const baseWidth = 800;
const baseHeight = 800;

const svg = d3.select('#map-container')
  .insert('svg', ':first-child')
  .attr('viewBox', `0 0 ${baseWidth} ${baseHeight}`)
  .attr('preserveAspectRatio', 'xMidYMid meet');

const g = svg.append('g').attr('will-change', 'transform');

// Projection for Japan
const projection = d3.geoMercator();
const path = d3.geoPath().projection(projection);

const zoom = d3.zoom()
  .scaleExtent([1, 12])
  .translateExtent([[0, 0], [baseWidth, baseHeight]])
  .on('zoom', (event) => {
    g.attr('transform', event.transform);
  });

svg.call(zoom);

// Reset zoom
d3.select('#zoom-reset').on('click', () => {
  resetZoom();
});

d3.select('#zoom-in').on('click', () => {
  svg.transition().duration(300).call(zoom.scaleBy, 1.5);
});

d3.select('#zoom-out').on('click', () => {
  svg.transition().duration(300).call(zoom.scaleBy, 0.75);
});

function getRegionClass(id) {
  if (id === 1) return 'hokkaido';
  if (id >= 2 && id <= 7) return 'tohoku';
  if (id >= 8 && id <= 14) return 'kanto';
  if (id >= 15 && id <= 23) return 'chubu';
  if (id >= 24 && id <= 30) return 'kansai';
  if (id >= 31 && id <= 35) return 'chugoku';
  if (id >= 36 && id <= 39) return 'shikoku';
  if (id >= 40 && id <= 47) return 'kyushu';
  return '';
}

function getRegionName(id) {
  if (id === 1) return 'Hokkaido';
  if (id >= 2 && id <= 7) return 'Tohoku';
  if (id >= 8 && id <= 14) return 'Kanto';
  if (id >= 15 && id <= 23) return 'Chubu';
  if (id >= 24 && id <= 30) return 'Kansai';
  if (id >= 31 && id <= 35) return 'Chugoku';
  if (id >= 36 && id <= 39) return 'Shikoku';
  if (id >= 40 && id <= 47) return 'Kyushu & Okinawa';
  return '';
}

function getCities(id) {
  const cityMap = {
    1: ['Sapporo', 'Hakodate', 'Otaru', 'Asahikawa'],
    4: ['Sendai', 'Matsushima'],
    13: ['Shinjuku', 'Shibuya', 'Akihabara', 'Asakusa'],
    14: ['Yokohama', 'Kamakura', 'Hakone'],
    23: ['Nagoya', 'Toyota', 'Okazaki'],
    26: ['Kyoto City', 'Uji', 'Maizuru'],
    27: ['Osaka City', 'Sakai', 'Higashiosaka'],
    28: ['Kobe', 'Himeji', 'Nishinomiya'],
    34: ['Hiroshima City', 'Fukuyama', 'Onomichi'],
    40: ['Fukuoka City', 'Kitakyushu', 'Kurume'],
    47: ['Naha', 'Okinawa City', 'Ishigaki']
  };
  return cityMap[id] || ['Capital City', 'Regional Hubs'];
}

function getDesc(id) {
  const descMap = {
    13: 'The bustling capital of Japan, blending ultramodern neon with traditional temples.',
    26: 'The cultural heart of Japan, famous for its classical Buddhist temples, gardens, and imperial palaces.',
    27: 'A large port city known for modern architecture, nightlife, and hearty street food.',
    1: 'The northernmost island, known for its volcanoes, natural hot springs, and ski areas.',
    47: 'A tropical paradise featuring pristine beaches and a unique Ryukyuan heritage.'
  };
  return descMap[id] || 'A vibrant prefecture rich in local culture, scenic landscapes, and distinct culinary traditions.';
}

function getGalleryImages(id) {
  const pools = {
    city: [
      '1540959733332-eab4deabeeaf', '1503899036084-c55cdd92da26', '1536098561742-ca998e48cbcc', '1514030806498-8ecbc6a39424'
    ],
    nature: [
      '1542640244-7e672d6cb466', '1580193147573-2e0618ff7e42', '1542317765-a6a3b2b0ce87', '1613374823192-3bc5c80db0e9'
    ],
    traditional: [
      '1493976040374-85c8e12f0c0e', '1528360983277-13d401cdc186', '1545569341-9eb8b30979d9', '1590559899731-a38283bce4ed'
    ]
  };

  let selectedPool = pools.traditional;
  if ([13, 27, 14, 23, 40].includes(id)) selectedPool = pools.city;
  if ([1, 2, 3, 4, 5, 6, 7, 47, 46].includes(id)) selectedPool = pools.nature;
  
  const img1 = selectedPool[id % selectedPool.length];
  const img2 = selectedPool[(id + 1) % selectedPool.length];
  const img3 = selectedPool[(id + 2) % selectedPool.length];

  const baseUrl = 'https://images.unsplash.com/photo-';
  const params = '?auto=format&fit=crop&w=400&q=80';
  
  return [`${baseUrl}${img1}${params}`, `${baseUrl}${img2}${params}`, `${baseUrl}${img3}${params}`];
}

const geojsonUrl = 'https://raw.githubusercontent.com/dataofjapan/land/master/japan.geojson';

let mapData = null;

d3.json(geojsonUrl).then(data => {
  mapData = data;
  projection.fitExtent([[20, 20], [baseWidth - 20, baseHeight - 20]], data);

  const prefectures = g.selectAll('path')
    .data(data.features)
    .enter()
    .append('path')
    .attr('d', path)
    .attr('class', d => `prefecture region-${getRegionClass(d.properties.id)}`)
    .attr('data-region', d => getRegionClass(d.properties.id))
    .on('mouseover', function(event, d) {
      d3.select(this).raise();
    })
    .on('click', clicked);

  // Filters logic
  d3.selectAll('.filter-btn').on('click', function() {
    d3.selectAll('.filter-btn').classed('active', false);
    d3.select(this).classed('active', true);
    
    const selectedRegion = d3.select(this).attr('data-region');
    
    if (selectedRegion === 'all') {
      prefectures.style('opacity', 1).style('pointer-events', 'auto');
    } else {
      prefectures.style('opacity', 0.2).style('pointer-events', 'none');
      prefectures.filter(d => getRegionClass(d.properties.id) === selectedRegion)
        .style('opacity', 1)
        .style('pointer-events', 'auto');
    }
  });
});

let activePrefecture = null;

function clicked(event, d) {
  event.stopPropagation();
  
  if (activePrefecture === d.properties.id) {
    resetZoom();
    return;
  }
  activePrefecture = d.properties.id;
  
  d3.selectAll('.prefecture').classed('active-pref', false);
  d3.select(this).classed('active-pref', true);
  
  const [[x0, y0], [x1, y1]] = path.bounds(d);
  
  const offsetX = baseWidth * 0.15;
  
  svg.transition().duration(750).call(
    zoom.transform,
    d3.zoomIdentity
      .translate(baseWidth / 2 - offsetX, baseHeight / 2)
      .scale(Math.min(12, 0.85 / Math.max((x1 - x0) / baseWidth, (y1 - y0) / baseHeight)))
      .translate(-(x0 + x1) / 2, -(y0 + y1) / 2)
  );

  showPopup(d);
}

function resetZoom() {
  activePrefecture = null;
  d3.selectAll('.prefecture').classed('active-pref', false);
  
  svg.transition().duration(750).call(
    zoom.transform,
    d3.zoomIdentity
  );
  hidePopup();
}

svg.on('click', resetZoom);

// Pop-up logic
const popup = document.getElementById('popup-panel');
const pTitle = document.getElementById('p-title');
const pJp = document.getElementById('p-jp');
const pRegion = document.getElementById('p-region');
const pDesc = document.getElementById('p-desc');
const pCities = document.getElementById('p-cities');

// Gallery logic
let currentGalleryIndex = 0;
let galleryLength = 0;

function updateGalleryUI() {
  const track = document.getElementById('p-gallery-track');
  const dots = document.querySelectorAll('.gallery-dots .dot');
  track.style.transform = `translateX(-${currentGalleryIndex * 100}%)`;
  
  dots.forEach((dot, idx) => {
    dot.classList.toggle('active', idx === currentGalleryIndex);
  });
}

document.getElementById('g-prev').addEventListener('click', () => {
  if (galleryLength === 0) return;
  currentGalleryIndex = (currentGalleryIndex - 1 + galleryLength) % galleryLength;
  updateGalleryUI();
});

document.getElementById('g-next').addEventListener('click', () => {
  if (galleryLength === 0) return;
  currentGalleryIndex = (currentGalleryIndex + 1) % galleryLength;
  updateGalleryUI();
});

function showPopup(d) {
  let name = d.properties.nam;
  name = name.replace(' Ken', '').replace(' Fu', '').replace(' To', '');
  
  pTitle.textContent = name;
  pJp.textContent = d.properties.nam_ja;
  pRegion.textContent = getRegionName(d.properties.id);
  pDesc.textContent = getDesc(d.properties.id);
  
  // Update Gallery
  const imgUrls = getGalleryImages(d.properties.id);
  const track = document.getElementById('p-gallery-track');
  const dotsContainer = document.getElementById('p-gallery-dots');
  
  track.innerHTML = '';
  dotsContainer.innerHTML = '';
  galleryLength = imgUrls.length;
  currentGalleryIndex = 0;
  
  imgUrls.forEach((url, i) => {
    const img = document.createElement('img');
    img.src = url;
    img.alt = `${name} scenery ${i+1}`;
    track.appendChild(img);
    
    const dot = document.createElement('div');
    dot.className = `dot ${i === 0 ? 'active' : ''}`;
    dot.addEventListener('click', () => {
      currentGalleryIndex = i;
      updateGalleryUI();
    });
    dotsContainer.appendChild(dot);
  });
  
  updateGalleryUI();
  
  const cities = getCities(d.properties.id);
  pCities.innerHTML = '';
  cities.forEach(city => {
    const li = document.createElement('li');
    li.innerHTML = `<span>${city}</span><span>→</span>`;
    pCities.appendChild(li);
  });
  
  popup.classList.add('active');
}

function hidePopup() {
  popup.classList.remove('active');
}
