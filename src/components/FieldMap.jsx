const MAP_SRC = '/field-map.png'

export default function FieldMap() {
  return (
    <div className="glass rounded-2xl overflow-hidden">
      <div className="px-4 py-3 divider flex items-center gap-2"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <span className="text-base">🗺️</span>
        <h2 className="text-sm font-bold text-white">Field Map</h2>
      </div>
      <div className="p-3">
        <img
          src={MAP_SRC}
          alt="Field map"
          draggable={false}
          className="w-full h-auto rounded-xl"
          style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.4)' }}
          onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex' }}
        />
        <div style={{ display: 'none' }}
          className="items-center justify-center h-40 rounded-xl flex-col gap-2"
          style2={{ background: 'rgba(0,0,0,0.2)' }}>
          <span className="text-3xl">🗺️</span>
          <span className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Add field-map.png to public/
          </span>
        </div>
      </div>
    </div>
  )
}
