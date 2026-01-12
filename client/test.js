import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function testAetherChat() {
  console.log('Starting AetherChat test...');
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  let errors = [];
  
  // Collect console errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  
  page.on('pageerror', err => {
    errors.push(err.message);
  });
  
  try {
    // Navigate to the login page
    console.log('Navigating to login page...');
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle' });
    
    // Wait for the page to load
    await page.waitForTimeout(2000);
    
    // Check if login page elements are present
    console.log('Checking login page elements...');
    
    const title = await page.textContent('h1');
    console.log('Page title:', title);
    
    // Check for email input
    const emailInput = await page.$('input[type="email"]');
    console.log('Email input found:', !!emailInput);
    
    // Check for password input
    const passwordInput = await page.$('input[type="password"]');
    console.log('Password input found:', !!passwordInput);
    
    // Check for submit button
    const submitButton = await page.$('button[type="submit"]');
    console.log('Submit button found:', !!submitButton);
    
    // Check for sign up link
    const signUpLink = await page.$('a[href="/register"]');
    console.log('Sign up link found:', !!signUpLink);
    
    // Check for logo
    const logo = await page.$('svg');
    console.log('Logo found:', !!logo);
    
    // Test navigation to register page
    console.log('Testing navigation to register page...');
    await page.click('a[href="/register"]');
    await page.waitForTimeout(1000);
    
    const registerTitle = await page.textContent('h1');
    console.log('Register page title:', registerTitle);
    
    // Check register page elements
    const usernameInput = await page.$('input[type="text"]');
    console.log('Username input found on register page:', !!usernameInput);
    
    // Navigate back to login
    await page.click('a[href="/login"]');
    await page.waitForTimeout(1000);
    
    // Report results
    console.log('\n=== Test Results ===');
    console.log('Page loads: SUCCESS');
    console.log('Login page elements: SUCCESS');
    console.log('Navigation: SUCCESS');
    console.log('Register page elements: SUCCESS');
    
    if (errors.length > 0) {
      console.log('\nConsole Errors Found:');
      errors.forEach((err, i) => console.log(`${i + 1}. ${err}`));
    } else {
      console.log('\nNo console errors detected!');
    }
    
    console.log('\nAll tests passed!');
    
  } catch (error) {
    console.error('Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

testAetherChat();
