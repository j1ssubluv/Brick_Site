# Reply templates

Email replies to "Request to buy" messages. Replace the `[brackets]` before sending.
Keep buyer names, addresses and phone numbers in the email thread only, never in the repo.

The hold time (48 hours) and shipping time (2 business days) are placeholders, not
policies. Set them to what you will honor, or delete the clause. A set is not reserved
until Lyle confirms, so "holding it for you" starts with template 1.

## 1. Set is available

> Subject: Re: Your request for [set name] ([set number])
>
> Hi [buyer name],
>
> Thanks for your request. The [set name] ([set number]) is available, and I'm holding it for you for [48 hours] while you decide.
>
> - Set: $[price] [× quantity, if more than one]
> - Shipping (USPS, to ZIP [ZIP]): $[shipping]
> - **Total: $[total]**
>
> [Only for sets over $100: This set ships via USPS and is insured at my cost, so there is no extra charge for that.]
>
> I'll send a PayPal Goods and Services request for the total to this email address. It takes a minute to pay, and the PayPal buyer protection applies. The set ships with tracking once the payment arrives, usually within [2 business days].
>
> Thanks,
> Lyle
> Retired Brick Co.
> retiredbrickco.com

## 2. Local pickup

> Hi [buyer name],
>
> The [set name] ([set number]) is available for local pickup at $[price], cash on pickup. I can meet in [public place, e.g. a store parking lot] on [days/times]. Tell me what works and I'll confirm.
>
> Thanks,
> Lyle

## 3. Already sold or pending

> Hi [buyer name],
>
> Thanks for your interest. Someone else asked about the [set name] first, so it is no longer available. Requests are answered in the order received. I add new sets regularly at retiredbrickco.com, and I'm happy to tell you if another copy turns up.
>
> Thanks,
> Lyle

## Reminders

- Put the shipping quote and the total in the same email so the buyer can pay right away.
- Sets over $100 ship via USPS, insured at Lyle's cost (see `CLAUDE.md`).
- After the buyer pays, mark the set `pending` or `sold` in `site/sets.json` (or lower
  `quantity`), then commit and push.
