/**
 * Unit tests for intakeParser
 * 
 * Run with: npx jest lib/__tests__/intakeParser.test.ts
 * Or use as inline examples/documentation
 */

import { parseFarmerMessage, ConfidenceLevel } from '../intakeParser'

describe('parseFarmerMessage', () => {
  describe('Name extraction', () => {
    it('should extract name from "my name is X" pattern', () => {
      const result = parseFarmerMessage('My name is John Brown.')
      expect(result.name).toBe('John Brown')
    })

    it('should extract name from Patois "mi name a X" pattern', () => {
      const result = parseFarmerMessage('Mi name a Mary Smith.')
      expect(result.name).toBe('Mary Smith')
    })

    it('should extract name from "name: X" pattern', () => {
      const result = parseFarmerMessage('Name: Bob Johnson')
      expect(result.name).toBe('Bob Johnson')
    })

    it('should extract name from "I am X" pattern', () => {
      const result = parseFarmerMessage('I am Sarah Williams')
      expect(result.name).toBe('Sarah Williams')
    })

    it('should return null if no name pattern found', () => {
      const result = parseFarmerMessage('I grow yam and banana.')
      expect(result.name).toBeNull()
    })
  })

  describe('Acres extraction', () => {
    it('should extract acres from "X acres" pattern', () => {
      const result = parseFarmerMessage('I have 5 acres.')
      expect(result.acres).toBe(5)
    })

    it('should extract decimal acres', () => {
      const result = parseFarmerMessage('About 2.5 acres in St Thomas.')
      expect(result.acres).toBe(2.5)
    })

    it('should extract from "about X acres" pattern', () => {
      const result = parseFarmerMessage('About 3 acres of land.')
      expect(result.acres).toBe(3)
    })

    it('should extract from "around X acres" pattern', () => {
      const result = parseFarmerMessage('Around 10 acres.')
      expect(result.acres).toBe(10)
    })

    it('should return null if no acres found', () => {
      const result = parseFarmerMessage('My name is John.')
      expect(result.acres).toBeNull()
    })
  })

  describe('Parish extraction', () => {
    it('should extract St Thomas', () => {
      const result = parseFarmerMessage('I am in St Thomas.')
      expect(result.parish).toBe('St Thomas')
    })

    it('should extract St. Thomas (with dot)', () => {
      const result = parseFarmerMessage('Located in St. Thomas.')
      expect(result.parish).toBe('St Thomas')
    })

    it('should extract Manchester', () => {
      const result = parseFarmerMessage('From Manchester, growing yam.')
      expect(result.parish).toBe('Manchester')
    })

    it('should extract Clarendon', () => {
      const result = parseFarmerMessage('Based in Clarendon.')
      expect(result.parish).toBe('Clarendon')
    })

    it('should return null for unknown location', () => {
      const result = parseFarmerMessage('I am from Miami.')
      expect(result.parish).toBeNull()
    })
  })

  describe('Crop extraction', () => {
    it('should extract known crops', () => {
      const result = parseFarmerMessage('Growing yam, banana, and callaloo.')
      expect(result.crops).toContain('yam')
      expect(result.crops).toContain('banana')
      expect(result.crops).toContain('callaloo')
    })

    it('should normalize crop names', () => {
      const result = parseFarmerMessage('Growing coco and pepper.')
      expect(result.crops).toContain('cocoa') // coco -> cocoa
      expect(result.crops).toContain('hot pepper') // pepper -> hot pepper
    })

    it('should deduplicate crops', () => {
      const result = parseFarmerMessage('Growing yam and yam and banana.')
      const yamCount = result.crops.filter(c => c === 'yam').length
      expect(yamCount).toBe(1)
    })

    it('should handle crops with "and" separator', () => {
      const result = parseFarmerMessage('I grow yam and banana and plantain.')
      expect(result.crops.length).toBeGreaterThanOrEqual(3)
      expect(result.crops).toContain('yam')
      expect(result.crops).toContain('banana')
      expect(result.crops).toContain('plantain')
    })

    it('should return empty array if no crops found', () => {
      const result = parseFarmerMessage('My name is John.')
      expect(result.crops).toEqual([])
    })
  })

  describe('Confidence calculation', () => {
    it('should return high confidence with 2+ fields', () => {
      const result = parseFarmerMessage('My name is John. I have 5 acres.')
      expect(result.confidence).toBe('high')
    })

    it('should return medium confidence with 1 field', () => {
      const result = parseFarmerMessage('My name is John.')
      expect(result.confidence).toBe('medium')
    })

    it('should return low confidence with no fields', () => {
      const result = parseFarmerMessage('Hello there.')
      expect(result.confidence).toBe('low')
    })
  })

  describe('Complete examples', () => {
    it('should parse complete message with all fields', () => {
      const result = parseFarmerMessage(
        'My name is John Brown. I have 5 acres in St Thomas. Growing yam, banana, and callaloo.'
      )
      
      expect(result.name).toBe('John Brown')
      expect(result.parish).toBe('St Thomas')
      expect(result.acres).toBe(5)
      expect(result.crops.length).toBeGreaterThanOrEqual(3)
      expect(result.confidence).toBe('high')
    })

    it('should parse Patois message', () => {
      const result = parseFarmerMessage(
        'Mi name a Mary. Mi have 2.5 acre in Clarendon. A grow pepper and ginger.'
      )
      
      expect(result.name).toBe('Mary')
      expect(result.parish).toBe('Clarendon')
      expect(result.acres).toBe(2.5)
      expect(result.crops).toContain('ginger')
      expect(result.crops).toContain('hot pepper')
      expect(result.confidence).toBe('high')
    })

    it('should handle edge cases', () => {
      const result = parseFarmerMessage('')
      expect(result.name).toBeNull()
      expect(result.parish).toBeNull()
      expect(result.acres).toBeNull()
      expect(result.crops).toEqual([])
      expect(result.confidence).toBe('low')
      expect(result.notes).toContain('Empty or invalid input')
    })
  })

  describe('Notes generation', () => {
    it('should add note for unusually short name', () => {
      const result = parseFarmerMessage('My name is AB.')
      expect(result.notes.length).toBeGreaterThan(0)
    })

    it('should add note when no crops detected', () => {
      const result = parseFarmerMessage('My name is John.')
      expect(result.notes).toContain('No known crops detected')
    })
  })
})
