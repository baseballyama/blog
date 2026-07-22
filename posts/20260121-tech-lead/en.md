---
title: What It Takes to Be a Tech Lead
date: 2026-01-21
---

At [Flyle](https://flyle.io/jp), where I work, I have been involved in technical decision-making as a tech lead for a long time.

Going forward (or in the near future), there will be more occasions to split up the role or to grow the next person who takes it on. So today, I want to lay out what I think a tech lead needs.

## 1. Working Backward from Business Strategy

In a for-profit company, product development is not an end in itself; it is a means of driving business growth. Technology selection therefore has to be a decision that aligns with business strategy, not with personal taste or what is currently in fashion.

That requires the ability to use tools like SWOT analysis to lay out your company's strengths, weaknesses, opportunities, and threats, and then translate that into criteria you can actually judge technology choices against.

At Flyle, for example, we defined the competitive advantage of our new product as "being able to analyze large volumes of data quickly." The important part here is not letting the strength stay an abstract slogan, but defining it in a form you can use for design and investment decisions.

Concretely, we defined "large volumes of data" as X0,000 records per tenant, and "quickly" as aggregation completing within roughly X seconds (the actual numbers are not public). This put technology selection in a state where it could be evaluated against performance requirements we had to meet, rather than a vague sense of "fast enough."

We were also, at the time, a startup in a growth phase, in a financial and organizational position where we could invest in a foundation that would strengthen our advantage over the medium to long term, even if it carried some up-front cost. In other words, we were at a phase where we could judge not only "performance in the ideal case" but also the practical question of "is this achievable with the company's current capacity."

With that as the premise, we compared several OLAP options. Snowflake and BigQuery were ruled out on cost. Our analytical queries tend to get complex, and our testing showed that the cost per query execution could run higher than expected. Since this is something we ship as a product, the more usage grows, the more queries get executed. We concluded that, given our situation at the time, it was likely to become too expensive.

Redshift was ruled out on performance. It would have been difficult to meet our performance requirements (aggregating data on the order of X0,000 records per tenant within roughly X seconds), so it could not guarantee the product's advantage.

The result of that comparison was that, at least under the assumptions we had then, ClickHouse was the strongest option for realistically meeting the performance requirements. However, many of our customers are enterprises with strict security requirements. That ruled out ClickHouse Cloud, so we went with self-hosting.

Running it ourselves means that, once you account for availability and redundancy, you need at least several compute nodes, and the infrastructure cost is far from trivial. ClickHouse also has a lot of tuning knobs, which raises the operational burden. In other words, this choice was a decision to knowingly take on cost and operational difficulty in exchange for the benefit of high performance.

We adopted ClickHouse anyway because meeting the performance requirements we had defined *was* the new product's competitive advantage. Not "because it's popular" or "because it's fast," but being able to speak with accountability to the question "is this cost justified in order to secure the business's competitive advantage" — that, I think, is the first thing a tech lead needs when choosing technology.

## 2. Overwhelming Ownership

A tech lead's role is not only to make technical decisions. It is to stay responsible, to the end, for the results those decisions produce.

For example, if the business strategy has led us to promise a customer a delivery date for a feature, the tech lead has to drive the team to completion so that promise is kept. And when a critical bug that shakes the foundation of the business occurs, such as data loss, they need to stay with it until the situation is resolved.

This does not necessarily mean staying on the front line of the work yourself. What matters more is leading the team to the goal of "solving the problem" by whatever means necessary, including reallocating team resources, negotiating scope reductions, revisiting priorities, or putting in an unglamorous stopgap fix.

## 3. Technical Dialogue

A tech lead serves as a technical compass for the team. That does not mean being the most knowledgeable person in every technical area. If anything, given how complex modern stacks have become, it is not realistic for one person to cover every area at production level.

What matters instead is the ability to draw out the knowledge of people who know more than you do, and turn it into the best decision.

In my case, for example, I have depth in the application layer (DB, backend, frontend), but limited hands-on experience building infrastructure. That does not mean I hand off infrastructure design and walk away. I catch up on it myself first, and go into the discussion with people who are strong in infrastructure holding a hypothesis and a design proposal. My style is to pose questions and sharpen my resolution on the topic by learning through the discussion.

There was also a case where we adopted a temporal data model for a feature. I understood the concept, but had no practical experience with it, so it was not among my initial options. A member with more experience proposed it, and I was able to conclude it was the best fit for the requirements. Decisions like that are hard to reach on individual knowledge alone.

The dialogue skill a tech lead needs is not just small talk. It is doing the reading up front even on unfamiliar territory, and coming to the discussion with a hypothesis. And then drawing out the team's strengths while landing on a technical judgment the team can genuinely agree with. I think it is the accumulation of that which becomes a tech lead's value.

## 4. A Standout Strength

That said, the title "tech lead" presupposes being a technical leader. Taking on the role with no technical strength tends to feel off to the people around you.

So I would recommend building at least one strength that makes people think "this area, I can leave to them." Strength counts for more with depth than with breadth.

In my case, I work as a core team member of the UI framework Svelte, and have relatively deep knowledge of compilers, parsers, and static analysis — the language-toolchain space. On top of that, at Fujitsu, where I joined as a new graduate, I spent a long time working on development standardization for a 300-person project.

Combining those two, I feel my strength is in getting the mechanics of development in order. For instance, when the same point keeps coming up in code review, I add a static analysis rule (writing my own when necessary) and turn it into a mechanism that stops the same comment from recurring, which cuts down review effort.

Likewise, when I felt testing the logic layer on the frontend was a problem, I implemented a custom compiler that extracts just the logic from Svelte components, giving us a foundation for writing tests focused on that logic.

I see these efforts as the product of two things: experience with development standardization made it easier to spot the bottlenecks dragging down team productivity, and knowledge of language toolchains made it possible to turn that into something effective.

A strength does not have to be a flashy accomplishment. Consistently producing value in a specific area and continuing to give it back to the team is what builds credibility and trust as a tech lead.

## 5. Designing Authority (For Those Appointing a Tech Lead)

The qualities above are largely ones the tech lead can grow through their own effort. What tends to get overlooked, though it is decisively important, is "how much authority the tech lead is given."

The tech lead's role is to set technical direction. But if you hand them the responsibility without the decision-making authority, the team does not function.

For example, if they conclude "we need to invest in infrastructure to meet the performance requirements" but have no budget discretion, and every decision waits on approval, the tech lead cannot set direction.
If they have promised a customer "we'll ship by this date" but cannot move scope or reprioritize, then all the ownership in the world leaves them with no lever to pull.

This is not a shortfall in the person. It is a problem of organizational design.

That is why whoever appoints a tech lead has to answer the following questions at the moment of appointment.

- Who holds the final say on technology selection
- When quality, schedule, and cost collide, who decides the priority
- Who can decide to cut scope or delay a release
- Who can carve out time to pay down technical debt

If this stays ambiguous, the tech lead becomes someone who carries only the accountability, not someone who decides. Decisions get slower, friction increases, people burn out, and in the end the organization's velocity drops.

Put the other way: when the authority is clearly designed, the tech lead functions as a technical compass, and the team can move forward with confidence.

Appointing a tech lead also means building a structure in which decisions get made.

## Summary

The qualities described in this article are what I think as of January 2026, and they should keep getting updated.

Also, since the scope of the "tech lead" role is not strictly defined in the first place, some readers may find parts of this off from their own experience.

I would be glad if you read it as one person's take.
