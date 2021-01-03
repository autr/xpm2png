# xpm2png

XPM to PNG conversion for Node. XPM stands for X-PixMap, a common image format used by the X window System in Linux for system icons.

```
const xpm2png = require('xpm2png')
const debug = false
const jimpImage = xpm2png( "/path/to/image.xml", debug )
```

Example implementation:

```

app.get('/convert', async function( req, res) {
  const input = './sample_1920×1280.xpm'
  const name = path.basename( input )
  const output = path.join( __dirname, './icons/' + name + '.png' )
  
  console.log( input, output )
  // -> "./sample_1920×1280.xpm" "./icons/sample_1920×1280.xpm.png"
  
  const exists = await fs.existsSync( output )
  if ( exists ) return res.sendFile( output )
  
  const img = await xpm2png( input, false )
  const file = await img.writeAsync( output )
  res.sendFile( output )
})
```