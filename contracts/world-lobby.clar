(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ROOM-EXISTS (err u101))
(define-constant ERR-ROOM-NOT-FOUND (err u102))

(define-constant ACCESS-PUBLIC u1)
(define-constant ACCESS-MEMBERS u2)
(define-constant ACCESS-PREMIUM u3)

(define-data-var contract-owner principal tx-sender)

(define-map rooms
  { room-id: (string-ascii 64) }
  {
    access-mode: uint,
    is-open: bool,
    created-at: uint,
    created-by: principal
  }
)

(define-map room-members
  {
    room-id: (string-ascii 64),
    who: principal
  }
  {
    joined-at: uint,
    added-by: principal
  }
)

(define-private (is-owner)
  (is-eq tx-sender (var-get contract-owner))
)

(define-private (room-exists (room-id (string-ascii 64)))
  (is-some (map-get? rooms { room-id: room-id }))
)

(define-public (create-room (room-id (string-ascii 64)) (access-mode uint) (is-open bool))
  (if (is-owner)
    (if (room-exists room-id)
      ERR-ROOM-EXISTS
      (let
        (
          (room-record {
            access-mode: access-mode,
            is-open: is-open,
            created-at: stacks-block-height,
            created-by: tx-sender
          })
        )
        (begin
          (map-set rooms { room-id: room-id } room-record)
          (print {
            event: "room-created",
            room-id: room-id,
            access-mode: access-mode,
            is-open: is-open
          })
          (ok room-record)
        )
      )
    )
    ERR-NOT-AUTHORIZED
  )
)

(define-public (set-room-open (room-id (string-ascii 64)) (is-open bool))
  (if (is-owner)
    (match (map-get? rooms { room-id: room-id })
      room-record
      (let
        (
          (updated-room (merge room-record { is-open: is-open }))
        )
        (begin
          (map-set rooms { room-id: room-id } updated-room)
          (print {
            event: "room-open-updated",
            room-id: room-id,
            is-open: is-open
          })
          (ok updated-room)
        )
      )
      ERR-ROOM-NOT-FOUND
    )
    ERR-NOT-AUTHORIZED
  )
)

(define-public (grant-room-access (room-id (string-ascii 64)) (recipient principal))
  (if (is-owner)
    (if (room-exists room-id)
      (let
        (
          (membership-record {
            joined-at: stacks-block-height,
            added-by: tx-sender
          })
        )
        (begin
          (map-set room-members
            {
              room-id: room-id,
              who: recipient
            }
            membership-record
          )
          (print {
            event: "room-access-granted",
            room-id: room-id,
            recipient: recipient
          })
          (ok membership-record)
        )
      )
      ERR-ROOM-NOT-FOUND
    )
    ERR-NOT-AUTHORIZED
  )
)

(define-public (revoke-room-access (room-id (string-ascii 64)) (recipient principal))
  (if (is-owner)
    (if (room-exists room-id)
      (begin
        (map-delete room-members
          {
            room-id: room-id,
            who: recipient
          }
        )
        (print {
          event: "room-access-revoked",
          room-id: room-id,
          recipient: recipient
        })
        (ok true)
      )
      ERR-ROOM-NOT-FOUND
    )
    ERR-NOT-AUTHORIZED
  )
)

(define-read-only (is-room-member (room-id (string-ascii 64)) (who principal))
  (is-some
    (map-get? room-members
      {
        room-id: room-id,
        who: who
      }
    )
  )
)

(define-read-only (can-enter (room-id (string-ascii 64)) (who principal))
  (match (map-get? rooms { room-id: room-id })
    room-record
    (if (get is-open room-record)
      (if (is-eq (get access-mode room-record) ACCESS-PUBLIC)
        true
        (is-room-member room-id who)
      )
      false
    )
    false
  )
)

(define-read-only (get-room (room-id (string-ascii 64)))
  (map-get? rooms { room-id: room-id })
)

(define-read-only (get-room-membership (room-id (string-ascii 64)) (who principal))
  (map-get? room-members
    {
      room-id: room-id,
      who: who
    }
  )
)

(define-read-only (get-owner)
  (var-get contract-owner)
)
