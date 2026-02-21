
from playwright.sync_api import sync_playwright

def verify_certificate_download():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            print('Navigating to test page...')
            page.goto('http://localhost:3002/es/test-certificate', timeout=60000)

            # Wait for content to load
            print('Waiting for certificate card...')
            page.wait_for_selector('text=Certificado de Curso', timeout=60000)

            # Verify button
            btn = page.get_by_role('button', name='Descargar PDF')
            if not btn.is_visible():
                print('Button not found!')
                page.screenshot(path='verification/not_found.png')
                return

            print('Button found. Clicking...')

            # Setup download handler
            with page.expect_download(timeout=60000) as download_info:
                btn.click()

            download = download_info.value
            print(f'Download started: {download.suggested_filename}')

            download.save_as('verification/' + download.suggested_filename)
            print('File downloaded successfully.')

            # Take screenshot of page
            page.screenshot(path='verification/certificate_page.png')

        except Exception as e:
            print(f'Error: {e}')
            page.screenshot(path='verification/error.png')
        finally:
            browser.close()

if __name__ == '__main__':
    verify_certificate_download()
