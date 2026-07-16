export const resizeImageFile = (file: File, maxWidth = 300, maxHeight = 300): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const reader = new FileReader()
    
    reader.onload = (e) => {
      img.src = e.target?.result as string
    }
    
    reader.onerror = (e) => reject(e)
    
    img.onload = () => {
      let width = img.width
      let height = img.height
      
      if (width > maxWidth || height > maxHeight) {
        if (width > height) {
          height = Math.round((height * maxWidth) / width)
          width = maxWidth
        } else {
          width = Math.round((width * maxHeight) / height)
          height = maxHeight
        }
      }
      
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height)
        resolve(canvas.toDataURL('image/jpeg', 0.8))
      } else {
        reject(new Error('Canvas context not available'))
      }
    }
    
    reader.readAsDataURL(file)
  })
}

export const resizeBase64 = (base64Str: string, maxWidth = 300, maxHeight = 300): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.src = base64Str
    
    img.onload = () => {
      let width = img.width
      let height = img.height
      
      if (width > maxWidth || height > maxHeight) {
        if (width > height) {
          height = Math.round((height * maxWidth) / width)
          width = maxWidth
        } else {
          width = Math.round((width * maxHeight) / height)
          height = maxHeight
        }
      }
      
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height)
        resolve(canvas.toDataURL('image/jpeg', 0.8))
      } else {
        reject(new Error('Canvas context not available'))
      }
    }
    img.onerror = (e) => reject(e)
  })
}
