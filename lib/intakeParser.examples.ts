/**
 * Examples and usage guide for intakeParser
 * 
 * This file demonstrates how to use parseFarmerMessage() in various scenarios.
 * You can run these examples or use them as reference.
 */

import { parseFarmerMessage } from './intakeParser'

// ============================================================================
// Example 1: Complete Information
// ============================================================================

export const example1 = () => {
  const message = 'My name is John Brown. I have 5 acres in St Thomas. Growing yam, banana, and callaloo.'
  
  const result = parseFarmerMessage(message)
  
  console.log('Example 1 - Complete Information:')
  console.log('Input:', message)
  console.log('Output:', result)
  console.log('Expected:', {
    name: 'John Brown',
    parish: 'St Thomas',
    acres: 5,
    crops: ['banana', 'callaloo', 'yam'],
    confidence: 'high',
    notes: [],
  })
  
  return result
}

// ============================================================================
// Example 2: Patois Format
// ============================================================================

export const example2 = () => {
  const message = 'Mi name a Mary Smith. Mi have 2.5 acre in Clarendon. A grow pepper and ginger.'
  
  const result = parseFarmerMessage(message)
  
  console.log('\nExample 2 - Patois Format:')
  console.log('Input:', message)
  console.log('Output:', result)
  console.log('Expected:', {
    name: 'Mary Smith',
    parish: 'Clarendon',
    acres: 2.5,
    crops: ['ginger', 'hot pepper'], // pepper -> hot pepper
    confidence: 'high',
    notes: [],
  })
  
  return result
}

// ============================================================================
// Example 3: Name Only
// ============================================================================

export const example3 = () => {
  const message = 'My name is Bob.'
  
  const result = parseFarmerMessage(message)
  
  console.log('\nExample 3 - Name Only:')
  console.log('Input:', message)
  console.log('Output:', result)
  console.log('Expected:', {
    name: 'Bob',
    parish: null,
    acres: null,
    crops: [],
    confidence: 'medium', // 1 field = medium
    notes: [],
  })
  
  return result
}

// ============================================================================
// Example 4: Crops Only
// ============================================================================

export const example4 = () => {
  const message = 'I grow yam, banana, and dasheen on my farm.'
  
  const result = parseFarmerMessage(message)
  
  console.log('\nExample 4 - Crops Only:')
  console.log('Input:', message)
  console.log('Output:', result)
  console.log('Expected:', {
    name: null,
    parish: null,
    acres: null,
    crops: ['banana', 'dasheen', 'yam'], // sorted
    confidence: 'medium', // 1 field = medium
    notes: [],
  })
  
  return result
}

// ============================================================================
// Example 5: About Acres
// ============================================================================

export const example5 = () => {
  const message = 'About 3 acres in Manchester. Name: Sarah.'
  
  const result = parseFarmerMessage(message)
  
  console.log('\nExample 5 - About Acres:')
  console.log('Input:', message)
  console.log('Output:', result)
  console.log('Expected:', {
    name: 'Sarah',
    parish: 'Manchester',
    acres: 3,
    crops: [],
    confidence: 'high', // 3 fields = high
    notes: [],
  })
  
  return result
}

// ============================================================================
// Example 6: Crop Synonyms
// ============================================================================

export const example6 = () => {
  const message = 'Growing coco and pepper in St Ann.'
  
  const result = parseFarmerMessage(message)
  
  console.log('\nExample 6 - Crop Synonyms:')
  console.log('Input:', message)
  console.log('Output:', result)
  console.log('Expected:', {
    name: null,
    parish: 'St Ann',
    acres: null,
    crops: ['cocoa', 'hot pepper'], // coco -> cocoa, pepper -> hot pepper
    confidence: 'medium',
    notes: [],
  })
  
  return result
}

// ============================================================================
// Example 7: Empty Input
// ============================================================================

export const example7 = () => {
  const message = ''
  
  const result = parseFarmerMessage(message)
  
  console.log('\nExample 7 - Empty Input:')
  console.log('Input:', '(empty string)')
  console.log('Output:', result)
  console.log('Expected:', {
    name: null,
    parish: null,
    acres: null,
    crops: [],
    confidence: 'low',
    notes: ['Empty or invalid input'],
  })
  
  return result
}

// ============================================================================
// Example 8: Real-world WhatsApp Message
// ============================================================================

export const example8 = () => {
  const message = `Hi, my name is James Wilson. 
  I have about 4 acres in Portland. 
  Currently growing yam, plantain, and callaloo. 
  Also have some ginger and turmeric.`
  
  const result = parseFarmerMessage(message)
  
  console.log('\nExample 8 - Real-world WhatsApp:')
  console.log('Input:', message)
  console.log('Output:', result)
  console.log('Expected:', {
    name: 'James Wilson',
    parish: 'Portland',
    acres: 4,
    crops: expect.arrayContaining(['yam', 'plantain', 'callaloo', 'ginger', 'turmeric']),
    confidence: 'high',
    notes: [],
  })
  
  return result
}

// ============================================================================
// Run all examples (for testing/demo)
// ============================================================================

if (require.main === module || process.env.RUN_EXAMPLES === 'true') {
  console.log('='.repeat(60))
  console.log('Intake Parser Examples')
  console.log('='.repeat(60))
  
  example1()
  example2()
  example3()
  example4()
  example5()
  example6()
  example7()
  example8()
  
  console.log('\n' + '='.repeat(60))
  console.log('All examples completed!')
  console.log('='.repeat(60))
}
