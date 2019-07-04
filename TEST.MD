# Tests

Tests to be performed before a new release

## Google Drive Settings

**LGD00** - Before each test, clear app data from Google Drive and from application.
*Lists, items and settings are not lost. Selected list remains the same. Side menu gets updated.*

**LGD01** -  While signed-out, perform changes and sign-in.<br/>
*Changes are maintained.*

**LGD02** - While signed-in, perform changes and sign-out. Sign-in<br/>
*Changes are maintained.*

**LGD03** - While signed-in, perform changes and sign-out. Perform some more changes and sign-in.<br/>
*Changes are maintained.*

**LGD04** - While signed-in on another device, perform changes. Sign-in on the main device.<br/>
*Remote is loaded.*

**LGD05** - While signed-in on the main device, perform some changes. Sign-out. Sign-in on another device and perform changes. Sign-in on the main device.<br/>
*Remote is loaded.*

**LGD06** - While signed-in on the main device, perform some changes. Sign-out. Sign-in on another device and perform changes. Perform some changes on the main device. Sign-in on the main device.<br/>
*Remote is loaded (changes are lost).*

**LGD07** - While signed-in on more than one device, perform changes in both at the same time. Sign-out from both devices. Sign-in on the main device.<br/>
*Last changes are maintained.*
