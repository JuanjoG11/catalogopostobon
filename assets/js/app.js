// ===== CONFIGURACION =====
const CONFIG = {
  categorias: {
    'TODOS': { icon: '🏪', label: 'Todos' },
    'GASEOSA': { icon: '🥤', label: 'Gaseosas' },
    'JUGOS': { icon: '🍊', label: 'Jugos' },
    'HIDRATANTES': { icon: '💧', label: 'Hidratantes' },
    'ENERGIZANTES': { icon: '⚡', label: 'Energizantes' },
    'AGUAS': { icon: '🫧', label: 'Aguas' },
    'BEBIDA DE TE': { icon: '🍵', label: 'Tés' },
    'CERVEZA': { icon: '🍺', label: 'Cervezas' },
    'ALIMENTOS': { icon: '🛒', label: 'Alimentos' },
    'CAFÉ': { icon: '☕', label: 'Café' },
  },
  coloresCat: {
    'GASEOSA': 'bg-gaseosa',
    'JUGOS': 'bg-jugos',
    'HIDRATANTES': 'bg-hidratantes',
    'ENERGIZANTES': 'bg-energizantes',
    'AGUAS': 'bg-aguas',
    'BEBIDA DE TE': 'bg-te',
    'CERVEZA': 'bg-cerveza',
    'ALIMENTOS': 'bg-alimentos',
    'CAFÉ': 'bg-cafe',
  },
  iconosProducto: {
    'GASEOSA': ['🥤', '🫧', '🍾'],
    'JUGOS': ['🍊', '🥭', '🫐', '🍋'],
    'HIDRATANTES': ['💧', '🏃', '⚡'],
    'ENERGIZANTES': ['⚡', '🔋', '🚀'],
    'AGUAS': ['💧', '🫧', '🌊'],
    'BEBIDA DE TE': ['🍵', '🫖', '🌿'],
    'CERVEZA': ['🍺', '🍻', '🥂'],
    'ALIMENTOS': ['🥫', '🍽️', '🫙'],
    'CAFÉ': ['☕', '🫘', '🌟'],
  }
};

// ===== ESTADO DE LA APP =====
let estado = {
  categoriaActiva: 'TODOS',
  marcaFiltro: 'TODAS',
  embalajesFiltro: 'TODOS',
  busqueda: '',
  orden: 'nombre',
  productoActivo: null,
};

// ===== UTILIDADES =====
const formatoPrecio = (precio) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(precio);

const getIconoProducto = (prod) => {
  const icons = CONFIG.iconosProducto[prod.categoria] || ['📦'];
  // Usar sabor para asignar icono más específico
  const sabor = (prod.sabor || '').toLowerCase();
  const iconMap = {
    'naranja': '🍊', 'manzana': '🍎', 'uva': '🍇', 'limón': '🍋', 'limon': '🍋',
    'mango': '🥭', 'mora': '🫐', 'lulo': '🟢', 'maracuyá': '🌺', 'maracuya': '🌺',
    'tropical': '🌴', 'tropicales': '🌴', 'fresa': '🍓', 'sandía': '🍉', 'sandia': '🍉',
    'coco': '🥥', 'durazno': '🍑', 'toronja': '🍊', 'mandarina': '🍊', 'kiwi': '🥝',
    'blue ice': '🧊', 'cola': '🥤', 'colombiana': '🇨🇴', 'seven up': '🟢',
    'bretaña': '🍾', 'tamarindo': '🌿', 'ginger ale': '🫧',
    'original': '⭐', 'light': '✨', 'refajo': '🍺', 'rosé': '🌸',
    'guayaba': '🍐', 'malta': '🌾', 'agua tónica': '🫧', 'aloe': '🌿',
    'aceite': '🥫', 'tomate': '🍅', 'mayonesa': '🫙', 'selecto': '☕',
    'salpicón': '🍹', 'salpicon': '🍹',
  };
  for (const [key, ico] of Object.entries(iconMap)) {
    if (sabor.includes(key)) return ico;
  }
  return icons[0];
};

const getColorCat = (cat) => CONFIG.coloresCat[cat] || 'bg-alimentos';

// ===== FILTRADO Y ORDENADO =====
const getProductosFiltrados = () => {
  const eliminados = getEliminados();
  let lista = [...productos].filter(p => !eliminados.includes(p.id));

  // Filtro categoría
  if (estado.categoriaActiva !== 'TODOS') {
    lista = lista.filter(p => p.categoria === estado.categoriaActiva);
  }

  // Filtro marca
  if (estado.marcaFiltro !== 'TODAS') {
    lista = lista.filter(p => p.marca === estado.marcaFiltro);
  }

  // Filtro embalaje
  if (estado.embalajesFiltro !== 'TODOS') {
    lista = lista.filter(p => p.embalaje === estado.embalajesFiltro);
  }

  // Filtro búsqueda
  if (estado.busqueda.trim()) {
    const q = estado.busqueda.toLowerCase().trim();
    lista = lista.filter(p =>
      p.nombre.toLowerCase().includes(q) ||
      p.marca.toLowerCase().includes(q) ||
      p.sabor.toLowerCase().includes(q) ||
      p.codigoBarra.includes(q) ||
      String(p.id).includes(q) ||
      p.presentacion.toLowerCase().includes(q)
    );
  }

  // Orden
  lista.sort((a, b) => {
    switch (estado.orden) {
      case 'precio-asc': return a.precio - b.precio;
      case 'precio-desc': return b.precio - a.precio;
      case 'codigo': return a.id - b.id;
      case 'marca': return a.marca.localeCompare(b.marca);
      default: return a.nombre.localeCompare(b.nombre);
    }
  });

  return lista;
};

// ===== RENDER CARD =====
const IMG_BASE      = 'assets/img/productos/';
const SUPA_URL_CAT  = 'https://ahcvjqrlggmfmyevgjqb.supabase.co';
const SUPA_ANON_CAT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFoY3ZqcXJsZ2dtZm15ZXZnanFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM4MDk1NDUsImV4cCI6MjEwOTM4NTU0NX0.S2i3UO9yCw-WQzmwi8Q_Fs_a3nyMQz0-IWeu_uVnG1s';
const SUPA_BUCKET   = 'productos';

// Estado global cargado desde Supabase
let _imgMap     = {};
let _nombres    = {};
let _eliminados = [];

async function initSupaImgMap() {
  try {
    const sbCat = supabase.createClient(SUPA_URL_CAT, SUPA_ANON_CAT);

    // Fotos del bucket
    const { data: archivos } = await sbCat.storage.from(SUPA_BUCKET).list('', { limit: 1000 });
    _imgMap = {};
    (archivos || []).forEach(f => {
      const m = f.name.match(/^img_(\d+)\.(\w+)$/);
      if (m) _imgMap[parseInt(m[1])] = m[2];
    });

    // Nombres y eliminados de la tabla
    const { data: cfg } = await sbCat.from('catalogo_config').select('clave, valor');
    (cfg || []).forEach(row => {
      if (row.clave === 'nombres')    _nombres    = row.valor || {};
      if (row.clave === 'eliminados') _eliminados = row.valor || [];
      if (row.clave === 'productos_custom') {
        const custom = row.valor || [];
        custom.forEach(p => {
          if (!productos.find(x => x.id === p.id)) productos.push(p);
        });
      }
    });
  } catch(e) {
    console.warn('No se pudo conectar a Supabase:', e);
  }
}

const getImgSrc     = (prod) => {
  const ext = _imgMap[prod.id];
  if (ext) return `${SUPA_URL_CAT}/storage/v1/object/public/${SUPA_BUCKET}/img_${prod.id}.${ext}`;
  if (prod.imagen) return `${IMG_BASE}${prod.imagen}`;
  return null;
};
const getNombreProd = (prod) => _nombres[prod.id] || prod.nombre;
const getEliminados = ()     => _eliminados;

const renderCard = (prod, delay = 0) => {
  const icon = getIconoProducto(prod);
  const colorCls = getColorCat(prod.categoria);
  const catInfo = CONFIG.categorias[prod.categoria] || { icon: '📦' };

  const imgHtml = getImgSrc(prod)
    ? `<img src="${getImgSrc(prod)}" alt="${prod.nombre}"
         loading="lazy"
         onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"
       >
       <div class="card-image-placeholder" style="display:none">
         <span class="placeholder-icon">${icon}</span>
         <span class="placeholder-vol">${prod.volumen}</span>
       </div>`
    : `<div class="card-image-placeholder">
         <span class="placeholder-icon">${icon}</span>
         <span class="placeholder-vol">${prod.volumen}</span>
       </div>`;

  return `
    <div class="product-card" onclick="abrirModal(${prod.id})" style="animation-delay:${delay}ms">
      <div class="card-image-area ${colorCls}">
        ${imgHtml}
        <span class="card-marca-badge">${prod.marca}</span>
        <span class="card-embalaje-badge">${prod.embalaje}</span>
      </div>
      <div class="card-body">
        <div class="card-nombre">${getNombreProd(prod)}</div>
        <div class="card-presentacion">${prod.presentacion}</div>
        <div class="card-meta">
          <span class="meta-chip"><span class="chip-icon">${catInfo.icon}</span>${prod.categoria}</span>
          <span class="meta-chip">x${prod.unidades} und</span>
        </div>
      </div>
      <div class="card-footer">
        <div>
          <div class="card-precio">${formatoPrecio(prod.precio)}</div>
          <div class="card-precio-label">Por paca</div>
        </div>
        <div style="text-align:right">
          <div class="card-id">#${prod.id}</div>
        </div>
      </div>
    </div>
  `;
};

// ===== RENDER GRID =====
const renderGrid = () => {
  const grid = document.getElementById('products-grid');
  const empty = document.getElementById('empty-state');
  const lista = getProductosFiltrados();

  document.getElementById('results-count').innerHTML =
    `<strong>${lista.length}</strong> productos`;

  if (lista.length === 0) {
    grid.innerHTML = '';
    empty.classList.add('show');
    return;
  }

  empty.classList.remove('show');
  grid.innerHTML = lista.map((p, i) => renderCard(p, Math.min(i * 30, 300))).join('');
};

// ===== MODAL =====
const abrirModal = (id) => {
  const prod = productos.find(p => p.id === id);
  if (!prod) return;
  estado.productoActivo = prod;

  const icon = getIconoProducto(prod);
  const colorCls = getColorCat(prod.categoria);
  const catInfo = CONFIG.categorias[prod.categoria] || { icon: '📦', label: prod.categoria };

  document.getElementById('modal-cat').textContent = `${catInfo.icon} ${catInfo.label}`;
  document.getElementById('modal-image').className = `modal-image ${colorCls}`;
  const modalImgContent = getImgSrc(prod)
    ? `<img src="${getImgSrc(prod)}" alt="${prod.nombre}"
         style="max-height:200px;max-width:100%;object-fit:contain;border-radius:12px;filter:drop-shadow(0 8px 20px rgba(0,0,0,0.5))"
         onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"
       >
       <div style="display:none;flex-direction:column;align-items:center;gap:12px">
         <span style="font-size:80px;filter:drop-shadow(0 8px 16px rgba(0,0,0,0.5))">${icon}</span>
         <span style="font-size:14px;color:rgba(255,255,255,0.5);font-weight:600;letter-spacing:2px;text-transform:uppercase">${prod.volumen}</span>
       </div>`
    : `<div style="display:flex;flex-direction:column;align-items:center;gap:12px">
         <span style="font-size:80px;filter:drop-shadow(0 8px 16px rgba(0,0,0,0.5))">${icon}</span>
         <span style="font-size:14px;color:rgba(255,255,255,0.5);font-weight:600;letter-spacing:2px;text-transform:uppercase">${prod.volumen}</span>
       </div>`;
  document.getElementById('modal-image').innerHTML = modalImgContent;
  document.getElementById('modal-nombre').textContent = getNombreProd(prod);
  document.getElementById('modal-presentacion').textContent = prod.presentacion;
  document.getElementById('modal-precio').textContent = formatoPrecio(prod.precio);
  document.getElementById('modal-unidades').textContent = `${prod.unidades} unidades por paca`;
  document.getElementById('modal-marca').textContent = prod.marca;
  document.getElementById('modal-sabor').textContent = prod.sabor;
  document.getElementById('modal-embalaje').textContent = prod.embalaje;
  document.getElementById('modal-peso').textContent = `${prod.peso} kg`;
  document.getElementById('modal-id').textContent = `#${prod.id}`;
  document.getElementById('modal-barcode-num').textContent = prod.codigoBarra || 'N/D';

  document.getElementById('modal-overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
};

const cerrarModal = () => {
  document.getElementById('modal-overlay').classList.remove('open');
  document.body.style.overflow = '';
  estado.productoActivo = null;
};

// ===== TABS CATEGORIAS =====
const renderCatTabs = () => {
  const container = document.getElementById('cat-tabs');
  const counts = {};
  productos.forEach(p => { counts[p.categoria] = (counts[p.categoria] || 0) + 1; });
  const total = productos.length;

  let html = `
    <button class="cat-btn ${estado.categoriaActiva === 'TODOS' ? 'active' : ''}" onclick="setCat('TODOS')">
      <span class="cat-icon">🏪</span> Todos <span class="cat-count">${total}</span>
    </button>`;

  for (const [cat, info] of Object.entries(CONFIG.categorias)) {
    if (cat === 'TODOS') continue;
    const count = counts[cat] || 0;
    if (count === 0) continue;
    html += `
      <button class="cat-btn ${estado.categoriaActiva === cat ? 'active' : ''}" onclick="setCat('${cat}')">
        <span class="cat-icon">${info.icon}</span> ${info.label} <span class="cat-count">${count}</span>
      </button>`;
  }

  container.innerHTML = html;
};

const setCat = (cat) => {
  estado.categoriaActiva = cat;
  estado.marcaFiltro = 'TODAS';
  renderCatTabs();
  actualizarSelectMarca();
  renderGrid();
};

// ===== SELECT MARCA =====
const actualizarSelectMarca = () => {
  const sel = document.getElementById('filter-marca');
  let lista = productos;
  if (estado.categoriaActiva !== 'TODOS') {
    lista = lista.filter(p => p.categoria === estado.categoriaActiva);
  }
  const marcas = [...new Set(lista.map(p => p.marca))].sort();
  sel.innerHTML = `<option value="TODAS">Todas las marcas</option>` +
    marcas.map(m => `<option value="${m}" ${estado.marcaFiltro === m ? 'selected' : ''}>${m}</option>`).join('');
};

// ===== EVENTOS =====
const initEventos = () => {
  // Búsqueda
  document.getElementById('search-input').addEventListener('input', (e) => {
    estado.busqueda = e.target.value;
    renderGrid();
  });

  // Filtro marca
  document.getElementById('filter-marca').addEventListener('change', (e) => {
    estado.marcaFiltro = e.target.value;
    renderGrid();
  });

  // Orden
  document.getElementById('filter-orden').addEventListener('change', (e) => {
    estado.orden = e.target.value;
    renderGrid();
  });

  // Cerrar modal al click fuera
  document.getElementById('modal-overlay').addEventListener('click', (e) => {
    if (e.target === document.getElementById('modal-overlay')) cerrarModal();
  });

  // ESC para cerrar modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') cerrarModal();
  });

  // Scroll top button
  window.addEventListener('scroll', () => {
    const btn = document.getElementById('scroll-top');
    if (window.scrollY > 400) btn.classList.add('visible');
    else btn.classList.remove('visible');
  });
};

// ===== INIT =====
const init = async () => {
  // Primero cargar el mapa de imágenes desde Supabase, luego renderizar
  await initSupaImgMap();

  renderCatTabs();
  actualizarSelectMarca();
  initEventos();
  renderGrid();

  // Stats en header
  document.getElementById('total-productos').textContent = productos.filter(p => !getEliminados().includes(p.id)).length;
  const marcas = new Set(productos.filter(p => !getEliminados().includes(p.id)).map(p => p.marca));
  document.getElementById('total-marcas').textContent = marcas.size;
};

document.addEventListener('DOMContentLoaded', init);
