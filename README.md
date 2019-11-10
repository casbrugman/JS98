![logo](https://raw.githubusercontent.com/cbarsugman/JS98/master/logo.png)


JS98 is a plain TypeScript/JavaScript + CSS library for making interactive Windows 98 like environments in the browser.

## Features
* Desktop Icons which can by default moved and activated in a Windows like fashion.
* Windows which can by default be maximized, minimized, closed, dragged and resized.
  
![logo](https://raw.githubusercontent.com/cbarsugman/JS98/master/header.png)

## How to use
1. Clone or download this repository.
2. Create a index.html of your liking.
3. Paste 98.js, style.css and the /res folder from the repository in the same folder al your index.html file.
4. Make a link to the style.css file.
5. Add a tag element to your index.html file and set the src to the 98.js file.
6. After that create a new script element in which you can use the classes provided.

> If you use TypeScript you can use the 98.ts file in the /source folder

```HTML
<!DOCTYPE html>
<html lang="en" dir="ltr">

<head>
  <title>JS98 example</title>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">  
  <link rel="stylesheet" type="text/css" href="style.css">
</head>

<body>
  <script src="98.js"></script>

  <script>
      //your code here
  </script>
</body>

</html>
```

## Examples
1. First create a new desktop to which you can later add icons & windows.
   
```typescript
var desktop = new JS98.Desktop()
```
2.  Create a new desktop icon and add it to the desktop.
```typescript
var icon = new JS98.Icon()
icon.title = "Insert title here"
desktop.Add(icon)
```
3. Make it so it opens a new window
```typescript
icon.action = function ()
{
    var window = new JS98.Window()
    window.size = new JS98.Vector2(40, 40)
    window.position = new JS98.Vector2(100, 100)
    let content = document.createElement("div")
    content.innerHTML = "Insert HTML here"
    window.content = document.createElement("div")
    window.title = "Insert window title here"
    window.icon = "Insert img src here"
    desktop.Add(window)
}
```
See the documentation for all other parameters.
 
## ToDo list
* Custom context menu's
* A taskbar
* Start button

## Documentation
### Desktop
#### Properties
| Type        | Name        |
| ----------- | ----------- |
| HTMLElement | element     |
| IconLayer   | iconLayer   |
| WindowLayer | windowLayer |
#### Methods
| Return type | Name                             |
| ----------- | -------------------------------- |
| void        | Add(Icon icon,Window window)     |
| void        | Remove(Icon icon, Window window) |

### IconLayer
#### Properties
| Type                              | Name    |
| --------------------------------- | ------- |
| HTMLElement                       | parent  |
| HTMLElement                       | element |
| HTMLCanvasElement                 | canvas  |
| CanvasRenderingContext2D          | ctx     |
| Icon[]                            | icons   |
| Icon                              | clicked |
| {start:Vector2,state:mouseStates} | mouse   |

#### Methods
| Return type | Name              |
| ----------- | ----------------- |
| void        | Add(Icon icon)    |
| void        | Remove(Icon icon) |

### WindowLayer
#### Properties
| Type        | Name    |
| ----------- | ------- |
| HTMLElement | parent  |
| HTMLElement | element |
| Window[]    | windows |

#### Methods
| Return type | Name                  |
| ----------- | --------------------- |
| void        | Add(Window window)    |
| void        | Remove(Window window) |

### Icon
#### Properties
| Type        | Name      |
| ----------- | --------- |
| HTMLElement | parent    |
| HTMLElement | element   |
| HTMLElement | titleSpan |
| function    | action    |
| Vector2     | position  |
| Vector2     | size      |
| string      | title     |
| boolean     | selected  |

#### Methods
| Return type | Name                   |
| ----------- | ---------------------- |
| void        | Execute()              |
| void        | Select()               |
| void        | Deselect()             |
| void        | Move(Vector2 position) |

### Window
#### Properties
| Type        | Name         |
| ----------- | ------------ |
| HTMLElement | parent       |
| HTMLElement | element      |
| HTMLElement | body         |
| Vector2     | minSize      |
| boolean     | fullscreen   |
| boolean     | resizeAble   |
| boolean     | minimizeAble |
| boolean     | maximizeAble |
| boolean     | closeAble    |
| Vector2     | position     |
| Vector2     | size         |
| string      | title        |
| string      | icon         |
| HTMLElement | content      |
| boolean     | active       |


#### Methods
| Return type | Name                          |
| ----------- | ----------------------------- |
| void        | SetPosition(Vector2 position) |
| void        | SetSize(Vector2 size)         |
| void        | SetTitle(string title)        |
| void        | SetContent(any HTMLElement)   |
| void        | SetActive(boolean active)     |

