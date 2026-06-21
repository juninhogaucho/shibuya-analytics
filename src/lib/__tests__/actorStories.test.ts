import { describe, expect, test } from 'vitest'
import {
  SHIBUYA_ACTOR_STORIES,
  getActorStoriesById,
  getActorStoriesForSurface,
  getActorStory,
} from '../actorStories'

const forbiddenClaims = [
  /proven\s+to\s+increase/i,
  /clients?\s+include/i,
  /partnered\s+with/i,
  /endorsed\s+by/i,
  /we\s+replace\s+all/i,
  /ai\s+predicts/i,
]

describe('Shibuya actor stories', () => {
  test('gives every actor a complete truth-bound story contract', () => {
    expect(SHIBUYA_ACTOR_STORIES.length).toBeGreaterThanOrEqual(9)

    for (const story of SHIBUYA_ACTOR_STORIES) {
      expect(story.label).toBeTruthy()
      expect(story.audienceLabel).toBeTruthy()
      expect(story.headline).toBeTruthy()
      expect(story.theirQuestion).toMatch(/\?$/)
      expect(story.storyBeats).toHaveLength(3)
      expect(story.whatShibuyaCanDo.length).toBeGreaterThanOrEqual(2)
      expect(story.whatTheyGiveUs.length).toBeGreaterThanOrEqual(2)
      expect(story.whatTheyPayFor.length).toBeGreaterThanOrEqual(1)
      expect(story.deliveryProof.length).toBeGreaterThanOrEqual(2)
      expect(story.truthBoundary).toBeTruthy()
      expect(story.cannotClaim.length).toBeGreaterThanOrEqual(2)
    }
  })

  test('keeps required trader, firm, partner, and research actors separate', () => {
    expect(getActorStory('retail_trader').owner).toBe('shibuya_b2c')
    expect(getActorStory('prop_trader').label).toBe('Prop trader')
    expect(getActorStory('broker_trader').label).toBe('Broker trader')
    expect(getActorStory('prop_firm').theirQuestion).not.toBe(getActorStory('prop_trader').theirQuestion)
    expect(getActorStory('broker').theirQuestion).not.toBe(getActorStory('broker_trader').theirQuestion)
    expect(getActorStory('tech_provider').truthBoundary).toMatch(/not a replacement pitch/i)
    expect(getActorStory('clinical_research_partner').truthBoundary).toMatch(/not medical advice/i)
  })

  test('routes direct trader story separately from partner distribution stories', () => {
    expect(getActorStoriesForSurface('story').map((story) => story.id)).toEqual(['retail_trader'])
    expect(getActorStoriesForSurface('solutions').map((story) => story.id)).toEqual([
      'retail_trader',
      'prop_trader',
      'broker_trader',
    ])
    expect(getActorStoriesForSurface('partners').map((story) => story.id)).toEqual([
      'prop_trader',
      'broker_trader',
      'prop_firm',
      'broker',
      'tech_provider',
      'growth_agency',
      'quant_research_partner',
      'clinical_research_partner',
    ])
  })

  test('refuses invented public proof language in actor copy', () => {
    for (const story of SHIBUYA_ACTOR_STORIES) {
      const body = JSON.stringify(story)

      for (const forbidden of forbiddenClaims) {
        expect(body).not.toMatch(forbidden)
      }
    }
  })

  test('throws when an unknown story id is requested', () => {
    expect(() => getActorStoriesById(['retail_trader', 'missing' as never])).toThrow(/Unknown Shibuya actor story/)
  })
})
